import { Economy, IEconomy } from "@database/Economy";

const DAILY_BASE_COINS = 100;
const DAILY_STREAK_BONUS = 25; // per streak day
const DAILY_COOLDOWN_MS = 86400000; // 24 hours
const STREAK_BREAK_MS = 172800000;  // 48 hours — break streak if exceeded

export interface DailyResult {
    coins: number;
    streak: number;
    nextClaim: Date;
    isStreak: boolean;
}

export class EconomyService {
    /** Fetch or create a user's economy profile */
    public async getProfile(userId: string, guildId: string): Promise<IEconomy> {
        let profile = await Economy.findOne({ userId, guildId });
        if (!profile) {
            profile = await Economy.create({ userId, guildId, coins: 0, dailyStreak: 0, lastDaily: null });
        }
        return profile;
    }

    /** Get current coin balance */
    public async getBalance(userId: string, guildId: string): Promise<number> {
        const profile = await this.getProfile(userId, guildId);
        return profile.coins;
    }

    /** Add coins (safe — rejects negative resulting balance) */
    public async addCoins(userId: string, guildId: string, amount: number): Promise<IEconomy> {
        const profile = await this.getProfile(userId, guildId);
        profile.coins = Math.max(0, profile.coins + amount);
        await profile.save();
        return profile;
    }

    /** Deduct coins — throws if insufficient balance */
    public async deductCoins(userId: string, guildId: string, amount: number): Promise<IEconomy> {
        const profile = await this.getProfile(userId, guildId);
        if (profile.coins < amount) throw new Error("Insufficient coins.");
        profile.coins -= amount;
        await profile.save();
        return profile;
    }

    /** Claim daily reward with streak logic */
    public async claimDaily(userId: string, guildId: string): Promise<DailyResult> {
        const profile = await this.getProfile(userId, guildId);
        const now = Date.now();

        if (profile.lastDaily) {
            const elapsed = now - profile.lastDaily.getTime();
            if (elapsed < DAILY_COOLDOWN_MS) {
                const nextClaim = new Date(profile.lastDaily.getTime() + DAILY_COOLDOWN_MS);
                throw new Error(`Daily already claimed. Next claim: <t:${Math.floor(nextClaim.getTime() / 1000)}:R>`);
            }
            // Break streak if more than 48 hours have passed
            if (elapsed > STREAK_BREAK_MS) {
                profile.dailyStreak = 0;
            }
        }

        profile.dailyStreak += 1;
        const bonus = Math.min(profile.dailyStreak, 30) * DAILY_STREAK_BONUS; // cap bonus at day 30
        const coinsEarned = DAILY_BASE_COINS + bonus;
        profile.coins += coinsEarned;
        profile.lastDaily = new Date(now);
        await profile.save();

        return {
            coins: coinsEarned,
            streak: profile.dailyStreak,
            nextClaim: new Date(now + DAILY_COOLDOWN_MS),
            isStreak: profile.dailyStreak > 1,
        };
    }

    /** Transfer coins between two users */
    public async transfer(fromUserId: string, toUserId: string, guildId: string, amount: number): Promise<void> {
        if (amount <= 0) throw new Error("Transfer amount must be positive.");
        await this.deductCoins(fromUserId, guildId, amount);
        await this.addCoins(toUserId, guildId, amount);
    }
}

export class RateLimitService {
    private limits: Map<string, { count: number; lastReset: number }> = new Map();

    constructor() {}

    /**
     * Standard 1.5s/1.0s lightweight cooldown for R3NDER commands
     * @param userId Unique user ID
     * @param isPremium Whether the user is a premium member
     * @returns Returns true if allowed, false if rate limited
     */
    public isAllowed(userId: string, isPremium: boolean = false): boolean {
        const cooldown = isPremium ? 1000 : 1500;
        
        // 1. Check Burst Protection (5 actions / 5 seconds)
        const burstKey = `burst:${userId}`;
        const canBurst = this.check(burstKey, 5, 5000);
        if (!canBurst) return false;

        // 2. Check Individual Cooldown
        const cooldownKey = `cooldown:${userId}`;
        return this.check(cooldownKey, 1, cooldown);
    }

    /**
     * Check if a user/key is rate limited
     */
    public check(key: string, maxAttempts: number, timeframeMs: number): boolean {
        const now = Date.now();
        const state = this.limits.get(key);

        if (!state) {
            this.limits.set(key, { count: 1, lastReset: now });
            return true;
        }

        if (now - state.lastReset > timeframeMs) {
            this.limits.set(key, { count: 1, lastReset: now });
            return true;
        }

        if (state.count >= maxAttempts) {
            return false;
        }

        state.count += 1;
        this.limits.set(key, state);
        return true;
    }

    public reset(key: string): void {
        this.limits.delete(key);
    }
}

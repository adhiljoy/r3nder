import { Analytics } from "../database/shared/Analytics";
import { Collection } from "discord.js";

interface GuildCache {
    messages: number;
    commands: Map<string, number>;
    activeUsers: Set<string>;
    topUsers: Map<string, number>; // memberId -> messageCount
    voiceConcurrent: number;
}

export class AnalyticsService {
    private cache: Collection<string, GuildCache> = new Collection();
    private syncInterval: NodeJS.Timeout;

    constructor() {
        this.syncInterval = setInterval(() => this.syncToDatabase(), 60000); // 1 minute flush
    }

    private _getGuildCache(guildId: string): GuildCache {
        let cache = this.cache.get(guildId);
        if (!cache) {
            cache = {
                messages: 0,
                commands: new Map(),
                activeUsers: new Set(),
                topUsers: new Map(),
                voiceConcurrent: 0
            };
            this.cache.set(guildId, cache);
        }
        return cache;
    }

    public trackMessage(guildId: string, userId: string): void {
        const cache = this._getGuildCache(guildId);
        cache.messages++;
        cache.activeUsers.add(userId);
        
        // Track for top users
        const count = cache.topUsers.get(userId) || 0;
        cache.topUsers.set(userId, count + 1);
    }

    public trackCommand(guildId: string, commandName: string, userId: string): void {
        const cache = this._getGuildCache(guildId);
        const current = cache.commands.get(commandName) || 0;
        cache.commands.set(commandName, current + 1);
        cache.activeUsers.add(userId);
    }

    public trackVoice(guildId: string, count: number): void {
        const cache = this._getGuildCache(guildId);
        if (count > cache.voiceConcurrent) {
            cache.voiceConcurrent = count;
        }
    }

    public getRealtimeStats(guildId: string) {
        const cache = this._getGuildCache(guildId);
        return {
            messagesPerMinute: cache.messages,
            activeUsers: cache.activeUsers.size,
            voiceActive: cache.voiceConcurrent
        };
    }

    private async syncToDatabase(): Promise<void> {
        const now = new Date();
        
        // 15-min bucket rounding
        const bucketTime = new Date(now);
        bucketTime.setMinutes(Math.floor(bucketTime.getMinutes() / 15) * 15, 0, 0);

        // Daily bucket rounding
        const dailyTime = new Date(now);
        dailyTime.setHours(0, 0, 0, 0);

        for (const [guildId, cache] of this.cache) {
            if (cache.messages === 0 && cache.commands.size === 0 && cache.voiceConcurrent === 0) continue;

            try {
                const update = {
                    $inc: { 
                        messages: cache.messages,
                        activeUsers: cache.activeUsers.size 
                    },
                    $max: { voiceAttendance: cache.voiceConcurrent }
                };

                // Sync for BOTH Daily and 15-min resolutions
                const resolutions: ("daily" | "15min")[] = ["daily", "15min"];
                
                for (const res of resolutions) {
                    const date = res === "daily" ? dailyTime : bucketTime;
                    
                    // Basic stats update
                    await Analytics.findOneAndUpdate(
                        { guildId, date, resolution: res },
                        update,
                        { upsert: true }
                    );

                    // Update Top Users (Top 5 only)
                    const sortedUsers = Array.from(cache.topUsers.entries())
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([id, count]) => ({ userId: id, messageCount: count }));

                    for (const user of sortedUsers) {
                        await Analytics.findOneAndUpdate(
                            { guildId, date, resolution: res, "topUsers.userId": user.userId },
                            { $inc: { "topUsers.$.messageCount": user.messageCount } },
                            { upsert: false }
                        );
                        // If doesn't exist, push it
                        await Analytics.findOneAndUpdate(
                            { guildId, date, resolution: res, "topUsers.userId": { $ne: user.userId } },
                            { $push: { topUsers: user } }
                        );
                    }

                    // Update Commands distribution
                    for (const [cmd, count] of cache.commands) {
                        await Analytics.findOneAndUpdate(
                            { guildId, date, resolution: res, "commands.name": cmd },
                            { $inc: { "commands.$.count": count } },
                            { upsert: false }
                        );
                        await Analytics.findOneAndUpdate(
                            { guildId, date, resolution: res, "commands.name": { $ne: cmd } },
                            { $push: { commands: { name: cmd, count: count } } }
                        );
                    }
                }

                // Reset cache (partial reset for rolling active users if needed, but here simple flush)
                cache.messages = 0;
                cache.commands.clear();
                cache.topUsers.clear();
                cache.voiceConcurrent = 0;
                // activeUsers is 15-min rolling, so we only clear it when we cross a 15-min boundary
                if (now.getMinutes() % 15 === 0) {
                    cache.activeUsers.clear();
                }

            } catch (error) {
                console.error(`[AnalyticsService] Sync Failed for ${guildId}:`, error);
            }
        }
    }

    public stop(): void {
        clearInterval(this.syncInterval);
    }
}

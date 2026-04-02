import { Log, LogType, LogPriority } from "@database/Log";
import { User } from "@database/User";
import { Guild } from "@database/Guild";
import { R3NDERClient } from "@client/R3nderClient";

export interface RiskAnalysis {
    score: number;
    reasons: string[];
    level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export class RiskService {
    private client: R3NDERClient;
    private scoreCache: Map<string, { analysis: RiskAnalysis, expires: number }> = new Map();

    constructor(client: R3NDERClient) {
        this.client = client;
    }

    /**
     * Analyze a user's recent activity to determine risk level
     */
    public async analyzeUser(userId: string, guildId: string): Promise<RiskAnalysis> {
        const cacheKey = `${guildId}:${userId}`;
        const cached = this.scoreCache.get(cacheKey);
        
        if (cached && cached.expires > Date.now()) {
            return cached.analysis;
        }

        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
        
        // Fetch recent logs for this user
        const logs = await Log.find({
            userId,
            guildId,
            timestamp: { $gte: thirtyMinsAgo }
        }).sort({ timestamp: -1 });

        const reasons: string[] = [];
        let score = 0;

        // 1. Message Spam Detection
        const messageLogs = logs.filter(l => l.type === LogType.MESSAGE);
        if (messageLogs.length > 20) {
            score += 30;
            reasons.push("High message frequency (Spam pattern)");
        }

        // 2. Rapid Command Usage
        const commandLogs = logs.filter(l => l.type === LogType.COMMAND);
        if (commandLogs.length > 15) {
            score += 20;
            reasons.push("Excessive command usage");
        }

        // 3. Join/Leave patterns
        const joinLeaveLogs = logs.filter(l => l.type === LogType.JOIN_LEAVE);
        if (joinLeaveLogs.length > 3) {
            score += 40;
            reasons.push("Rapid join/leave cycle (Potential bot/raid)");
        }

        // 4. Deletion patterns
        const deletionLogs = logs.filter(l => l.action === "MESSAGE_DELETE");
        if (deletionLogs.length > 5) {
            score += 15;
            reasons.push("Multiple deleted messages");
        }

        // Determine Level
        let level: RiskAnalysis["level"] = "LOW";
        if (score >= 80) level = "CRITICAL";
        else if (score >= 55) level = "HIGH";
        else if (score >= 30) level = "MEDIUM";

        const analysis: RiskAnalysis = { score, reasons, level };
        this.scoreCache.set(cacheKey, { analysis, expires: Date.now() + 5 * 60 * 1000 });

        return analysis;
    }

    /**
     * Check for global guild raids
     */
    public async checkGuildRaid(guildId: string): Promise<boolean> {
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        const recentJoins = await Log.countDocuments({
            guildId,
            action: "MEMBER_JOIN",
            timestamp: { $gte: fiveMinsAgo }
        });

        // Threshold: 10 joins in 5 minutes
        if (recentJoins >= 10) {
            this.triggerRaidAlert(guildId, recentJoins);
            return true;
        }

        return false;
    }

    private async triggerRaidAlert(guildId: string, joinCount: number) {
        const guildData = await Guild.findOne({ guildId });
        if (!guildData || !guildData.logChannelId) return;

        this.client.logs.critical(
            "RAID_DETECTION",
            `🚨 **RAID ALERT**: ${joinCount} members joined in the last 5 minutes. Autopilot suggested: Restricted Join Mode.`,
            guildId
        );
    }
}

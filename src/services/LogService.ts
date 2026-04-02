import { Client, TextChannel, EmbedBuilder, ColorResolvable } from "discord.js";
import axios from "axios";
import { Log, LogPriority, LogType } from "@database/Log";
import { MusicLog, MusicEventType, IMusicLog } from "@database/MusicLog";
import { Guild } from "@database/Guild";

export class LogService {
    private client: Client;
    private logQueue: any[] = [];
    private syncInterval: NodeJS.Timeout;

    constructor(client: Client) {
        this.client = client;
        this.syncInterval = setInterval(() => this.flushLogs(), 60000); // 1 minute batch
    }

    /**
     * Core logging method
     */
    public async log(data: {
        type: LogType;
        priority: LogPriority;
        action: string;
        content: string;
        userId?: string;
        guildId?: string;
        targetId?: string;
        changes?: any;
        metadata?: any;
    }) {
        const logEntry = {
            ...data,
            timestamp: new Date()
        };

        this.logQueue.push(logEntry);

        // 1. Real-time alerts for ERROR/CRITICAL (Bot Admins)
        if (data.priority === LogPriority.ERROR || data.priority === LogPriority.CRITICAL) {
            this.sendAdminAlert(logEntry);
        }

        // 2. Real-time broadcast to Guild Log Channel (Server Admins)
        if (data.guildId) {
            this.broadcastToGuild(data.guildId, logEntry);
        }

        // 3. Real-time push to Dashboard
        this.pushToDashboard(logEntry);
    }

    private async pushToDashboard(log: any) {
        try {
            await axios.post("http://localhost:3001/api/internal/logs/push", log);
        } catch (err) {
            // Silently fail to avoid console Spam on dashboard downtime
        }
    }

    /**
     * Specialized logging helpers
     */
    public info(action: string, content: string, guildId?: string, userId?: string, metadata?: any) {
        this.log({ type: LogType.SYSTEM, priority: LogPriority.INFO, action, content, guildId, userId, metadata });
    }

    public warn(action: string, content: string, guildId?: string, userId?: string, metadata?: any) {
        this.log({ type: LogType.SYSTEM, priority: LogPriority.WARN, action, content, guildId, userId, metadata });
    }

    public error(action: string, content: string, guildId?: string, userId?: string, metadata?: any) {
        this.log({ type: LogType.ERROR, priority: LogPriority.ERROR, action, content, guildId, userId, metadata });
    }

    public critical(action: string, content: string, guildId?: string, userId?: string, metadata?: any) {
        this.log({ type: LogType.SYSTEM, priority: LogPriority.CRITICAL, action, content, guildId, userId, metadata });
    }

    /**
     * Specialized music event logger — writes to `music_logs` collection
     */
    public async logMusic(data: {
        guildId:     string;
        userId:      string;
        username:    string;
        event:       MusicEventType;
        trackTitle:  string;
        trackUrl?:   string;
        trackAuthor?: string;
        source?:     string;
        volume?:     number;
        duration?:   number;
    }): Promise<void> {
        try {
            // Write to dedicated music_logs collection (immediate, not batched)
            await MusicLog.create({
                ...data,
                trackUrl: data.trackUrl ?? "",
                timestamp: new Date(),
            });

            // Also enqueue to general log stream for dashboard real-time feed
            this.log({
                type: LogType.MUSIC,
                priority: LogPriority.INFO,
                action: data.event,
                content: `[${data.event}] ${data.trackTitle} — by ${data.username}`,
                guildId: data.guildId,
                userId:  data.userId,
                metadata: {
                    trackUrl:    data.trackUrl,
                    trackAuthor: data.trackAuthor,
                    source:      data.source,
                    volume:      data.volume,
                },
            });
        } catch (err) {
            console.error("[LogService] Music log write failed:", err);
        }
    }


    /**
     * Broadcast logs to designated Guild Channel
     */
    private async broadcastToGuild(guildId: string, log: any) {
        try {
            const guildData = await Guild.findOne({ guildId });
            if (!guildData || !guildData.logChannelId) return;

            const channel = await this.client.channels.fetch(guildData.logChannelId).catch(() => null) as TextChannel;
            if (!channel) return;

            const emoji = this.getLogEmoji(log.type);
            const color = this.getLogColor(log.priority);

            const embed = new EmbedBuilder()
                .setTitle(`${emoji} ${log.action.toUpperCase()}`)
                .setDescription(log.content)
                .setColor(color as ColorResolvable)
                .setTimestamp();

            if (log.userId) {
                const user = await this.client.users.fetch(log.userId).catch(() => null);
                if (user) embed.setFooter({ text: `Action by: ${user.tag}`, iconURL: user.displayAvatarURL() });
            }

            if (log.changes) {
                let diffText = "";
                for (const [key, value] of Object.entries(log.changes)) {
                    const change = value as { old: any, new: any };
                    diffText += `**${key}**: \`${change.old}\` ➔ \`${change.new}\`\n`;
                }
                if (diffText) embed.addFields({ name: "Changes", value: diffText });
            }

            await channel.send({ embeds: [embed] }).catch(() => {});
        } catch (err) {
            console.error(`[LogService Broadcast Error - ${guildId}]`, err);
        }
    }

    /**
     * Send alerts to Bot Owner / Admins for critical events
     */
    private async sendAdminAlert(log: any) {
        try {
            const adminIds = (process.env.ADMIN_IDS || "").split(",");
            const emoji = log.priority === LogPriority.CRITICAL ? "🚨" : "⚠️";
            
            const embed = new EmbedBuilder()
                .setTitle(`${emoji} ${log.priority.toUpperCase()} Alert`)
                .setDescription(log.content)
                .addFields(
                    { name: "Action", value: log.action || "N/A", inline: true },
                    { name: "Type", value: log.type, inline: true },
                    { name: "Guild", value: log.guildId || "N/A", inline: true }
                )
                .setColor(log.priority === LogPriority.CRITICAL ? "#FF0000" : "#FFA500")
                .setTimestamp();

            for (const id of adminIds) {
                if (!id) continue;
                const user = await this.client.users.fetch(id).catch(() => null);
                if (user) {
                    await user.send({ embeds: [embed] }).catch(() => {});
                }
            }
        } catch (err) {
            console.error("[LogService Admin Alert Error]", err);
        }
    }

    private getLogEmoji(type: LogType): string {
        switch (type) {
            case LogType.MESSAGE: return "💬";
            case LogType.COMMAND: return "⚡";
            case LogType.MOD: return "🛡️";
            case LogType.AI: return "🤖";
            case LogType.SYSTEM: return "⚙️";
            case LogType.ERROR: return "❌";
            case LogType.VOICE: return "🎤";
            case LogType.JOIN_LEAVE: return "👥";
            default: return "📝";
        }
    }

    private getLogColor(priority: LogPriority): string {
        switch (priority) {
            case LogPriority.CRITICAL: return "#FF0000";
            case LogPriority.ERROR: return "#EF4444";
            case LogPriority.WARN: return "#F59E0B";
            case LogPriority.INFO: return "#3B82F6";
            default: return "#FFFFFF";
        }
    }

    /**
     * Batch write logs to Database
     */
    private async flushLogs() {
        if (this.logQueue.length === 0) return;

        const logsToInsert = [...this.logQueue];
        this.logQueue = [];

        try {
            await Log.insertMany(logsToInsert);
            console.log(`[LogService] Successfully flushed ${logsToInsert.length} logs to DB.`);
        } catch (err) {
            console.error("[LogService Flush Error]", err);
            this.logQueue.unshift(...logsToInsert);
        }
    }

    public stop() {
        clearInterval(this.syncInterval);
        return this.flushLogs(); // Final flush on shutdown
    }
}

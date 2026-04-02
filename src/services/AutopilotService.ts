import { Client, TextChannel, EmbedBuilder, Message } from "discord.js";
import { AIService } from "./AIService";
import { Guild } from "@database/Guild";
import { User } from "@database/User";
import { LogPriority, LogType } from "@database/Log";
import { RateLimitService } from "./RateLimitService";
import { R3NDERClient } from "@client/R3nderClient";

export class AutopilotService {
    private client: Client;
    private ai: AIService;
    private ratelimit: RateLimitService;
    private lastActivity: Map<string, number> = new Map();

    constructor(client: Client, ai: AIService) {
        this.client = client;
        this.ai = ai;
        this.ratelimit = new RateLimitService();
        // Background engagement disabled for controlled environment
        // this.startInactivityMonitor();
    }


    /**
     * Centralized message handler for AI Autopilot triggers
     */
    public async handleMessage(message: Message, guildData: any): Promise<boolean> {
        // 1. Safety & Enable Check
        if (message.author.bot || !guildData.aiAutopilot.enabled) return false;

        // 2. Dual-Mode Detection: Trigger Words OR Reply to Bot
        const contentLower = message.content.toLowerCase();
        const triggers = ["r3nder", "render"];
        const foundTrigger = triggers.find(t => contentLower.startsWith(t));
        
        let isReplyToBot = false;
        if (message.reference?.messageId) {
            try {
                const referencedMsg = await message.channel.messages.fetch(message.reference.messageId);
                if (referencedMsg.author.id === this.client.user?.id) {
                    isReplyToBot = true;
                }
            } catch (err) {
                // Message might be deleted or inaccessible
            }
        }

        if (!foundTrigger && !isReplyToBot) return false;

        // 3. Authorization Check (Admins OR Whitelisted Users)
        const adminIds = (process.env.ADMIN_IDS || "").split(",");
        const isWhitelisted = guildData.aiAutopilot.allowedUsers?.includes(message.author.id);
        const isAdmin = adminIds.includes(message.author.id) || message.member?.permissions.has("Administrator");

        if (!isAdmin && !isWhitelisted) return false;

        // 4. Rate Limiting Check
        const canUserProceed = this.ratelimit.isAllowed(message.author.id, guildData.isPremium);
        if (!canUserProceed) return false;

        // 5. Context Cleaning
        let cleanedContent = message.content;
        if (foundTrigger) {
            cleanedContent = message.content.slice(foundTrigger.length).trim();
        }
        
        if (!cleanedContent && !isReplyToBot) return false;


        try {
            await (message.channel as TextChannel).sendTyping();

            // 6. Intent Detection
            const intent = this.detectIntent(cleanedContent);
            let response = "";

            switch (intent) {
                case "WEATHER":
                    // Simple weather mock (service doesn't exist yet but intent is ready)
                    response = "I'm currently preparing my satellite metrics to provide real-time weather. Stay tuned! ☁️";
                    break;
                case "NICKNAME":
                    response = "I've detected a nickname request! Please use `/setnickname` so my internal records stay synchronized. 🏷️";
                    break;
                case "MUSIC":
                    response = "I've noted your interest in music! I've activated my sonic core — use `/play` or see my dynamic control panel for seamless playback. 🎵";
                    break;
                default:
                    // General Chat
                    response = await this.ai.chat(
                        message.author.id, 
                        message.guildId!, 
                        message.channelId, 
                        cleanedContent
                    );
            }

            // 7. Global Logging (AI Response)
            (this.client as R3NDERClient).logs.log({
                type: LogType.AI,
                priority: LogPriority.INFO,
                action: "AI_CONTROLLED_RESPONSE",
                content: `AI responded to ${message.author.tag} [Intent: ${intent}]: ${response.slice(0, 50)}...`,
                userId: message.author.id,
                guildId: message.guildId!,
                metadata: { prompt: cleanedContent, response, intent }
            });

            await message.reply({ content: response, allowedMentions: { repliedUser: true } });
            return true;
        } catch (error) {
            console.error("[Autopilot Message Error]", error);
        }

        return false;
    }

    /**
     * Intent Classifier for Assistant Logic
     */
    private detectIntent(content: string): "WEATHER" | "NICKNAME" | "MUSIC" | "GENERAL" {
        const lower = content.toLowerCase();
        if (lower.includes("weather") || lower.includes("temperature") || lower.includes("clouds")) return "WEATHER";
        if (lower.includes("nickname") || lower.includes("call me")) return "NICKNAME";
        if (lower.includes("music") || lower.includes("play") || lower.includes("song")) return "MUSIC";
        return "GENERAL";
    }


    /**
     * Record activity in a channel to reset inactivity timers
     */
    public recordActivity(channelId: string): void {
        this.lastActivity.set(channelId, Date.now());
    }

    /**
     * Start a background process to monitor channel inactivity
     */
    private startInactivityMonitor(): void {
        setInterval(async () => {
            const now = Date.now();
            const guilds = await Guild.find({ "aiAutopilot.inactiveEngage": true });

            for (const guildData of guilds) {
                const guild = this.client.guilds.cache.get(guildData.guildId);
                if (!guild) continue;

                const threshold = (guildData.aiAutopilot.engagementInterval || 4) * 3600000;
                const textChannels = guild.channels.cache.filter(c => c.isTextBased()) as Map<string, TextChannel>;
                
                for (const [id, channel] of textChannels) {
                    const lastActive = this.lastActivity.get(id) || now - threshold;
                    
                    if (now - lastActive >= threshold) {
                        await this.engageInactiveChannel(channel, guildData.guildId);
                        this.recordActivity(id);
                    }
                }
            }
        }, 1800000); // Check every 30 mins
    }

    private async engageInactiveChannel(channel: TextChannel, guildId: string): Promise<void> {
        try {
            const personality = "funny"; // Default for engagement
            const prompt = "The chat is quiet. Start a conversation with something relevant to the server's pulse.";
            const iceBreaker = await this.ai.chat(this.client.user!.id, guildId, channel.id, prompt);

            const embed = new EmbedBuilder()
                .setTitle("✨ R3NDER Insight")
                .setDescription(iceBreaker)
                .setColor("#5865F2")
                .setFooter({ text: "AI Autopilot • Re-engaging chat" });

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error("[Autopilot Engagement Error]", error);
        }
    }
}

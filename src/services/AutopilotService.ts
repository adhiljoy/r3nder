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
        this.startInactivityMonitor();
    }

    /**
     * Centralized message handler for AI Autopilot triggers
     */
    public async handleMessage(message: Message, guildData: any): Promise<boolean> {
        if (!guildData.aiAutopilot.enabled) return false;

        const triggers = ["render", "ren", "r3nder"];
        const contentLower = message.content.toLowerCase();
        const foundTrigger = triggers.find(t => contentLower.startsWith(t));
        const isMentioned = message.mentions.has(this.client.user!);
        const isQuestion = await this.ai.isPrompt(message.content);
        
        // Cooldown keys
        const userCooldownKey = `ai_user:${message.author.id}`;
        const autoReplyCooldownKey = `ai_auto:${message.guildId}`;

        let cleanedContent = message.content;
        if (foundTrigger) {
            cleanedContent = message.content.slice(foundTrigger.length).trim();
        } else if (isMentioned) {
            cleanedContent = message.content.replace(`<@!${this.client.user?.id}>`, "").replace(`<@${this.client.user?.id}>`, "").trim();
        }

        // Decision logic: Should we respond?
        const canUserProceed = this.ratelimit.isAllowed(message.author.id, guildData.isPremium);
        
        const shouldRespond = (
            (isMentioned && guildData.aiAutopilot.mentionResponse) || 
            (foundTrigger) || 
            (guildData.aiAutopilot.autoReply && isQuestion && this.ratelimit.check(autoReplyCooldownKey, 1, 10000))
        ) && canUserProceed;

        if (shouldRespond) {
            try {
                // Fetch user for personalization
                const userData = await User.findOne({ userId: message.author.id, guildId: message.guildId });
                
                await (message.channel as TextChannel).sendTyping();
                
                const response = await this.ai.chat(
                    message.author.id, 
                    message.guildId!, 
                    message.channelId, 
                    cleanedContent,
                    userData?.nickname
                );

                // Global Logging (AI Response)
                (this.client as R3NDERClient).logs.log({
                    type: LogType.AI,
                    priority: LogPriority.INFO,
                    action: "AI_RESPONSE",
                    content: `AI responded to ${message.author.tag}: ${response.slice(0, 50)}...`,
                    userId: message.author.id,
                    guildId: message.guildId!,
                    metadata: { prompt: cleanedContent, response }
                });

                await message.reply(response);
                return true;
            } catch (error) {
                console.error("[Autopilot Message Error]", error);
            }
        }

        return false;
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

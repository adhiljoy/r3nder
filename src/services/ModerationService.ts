import { Client, TextChannel, Message, EmbedBuilder, GuildMember } from "discord.js";
import { AIService } from "./AIService";
import { Guild } from "../database/shared/Guild";

export class ModerationService {
    private ai: AIService;
    private warnings: Map<string, number> = new Map();

    constructor(ai: AIService) {
        this.ai = ai;
    }

    /**
     * Process a message for potential moderation actions
     */
    public async processMessage(message: Message): Promise<boolean> {
        if (!message.guild || message.author.bot) return false;

        const guildData = await Guild.findOne({ guildId: message.guild.id });
        if (!guildData?.aiAutopilot?.toxicityFilter) return false;

        const isToxic = await this.ai.checkToxicity(message.content);
        if (!isToxic) return false;

        // Toxicity detected: delete and warn
        await this.handleToxicity(message);
        return true;
    }

    private async handleToxicity(message: Message): Promise<void> {
        const userId = message.author.id;
        const currentWarnings = (this.warnings.get(userId) || 0) + 1;
        this.warnings.set(userId, currentWarnings);

        // Delete the toxic message
        await message.delete().catch(() => {});

        const channel = message.channel as TextChannel;
        const member = message.member;

        if (currentWarnings >= 3) {
            // Repeated offense: Timeout (1 hour)
            if (member && member.moderatable) {
                await member.timeout(3600000, "Automated AI moderation: Repeated toxic behavior.");
                this.warnings.set(userId, 0); // Reset after timeout
                
                const embed = new EmbedBuilder()
                    .setTitle("🔇 User Timed Out")
                    .setDescription(`**${message.author.username}** has been timed out for 1 hour due to repeated toxic messages.`)
                    .setColor("#ED4245")
                    .setTimestamp();
                
                await channel.send({ embeds: [embed] });
            }
        } else {
            // First/Second offense: Warning
            const embed = new EmbedBuilder()
                .setTitle("⚠️ Warning: Toxicity")
                .setDescription(`Hey <@${userId}>, your message was flagged as toxic and removed. Please remain respectful. \n(Warning ${currentWarnings}/3)`)
                .setColor("#FEE75C")
                .setTimestamp();

            const warningMsg = await channel.send({ embeds: [embed] });
            setTimeout(() => warningMsg.delete().catch(() => {}), 10000);
        }
    }
}

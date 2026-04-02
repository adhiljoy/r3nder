import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { R3NDERClient } from "../../client/R3nderClient";
import { Command } from "../../types/index";

const daily: Command = {
    data: new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Claim your daily coin reward (24h cooldown)"),
    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const rateLimitKey = `daily-cmd:${interaction.user.id}`;
        if (!client.ratelimit.check(rateLimitKey, 1, 5000)) {
            await interaction.reply({ content: "⚠️ Please wait a moment before trying again.", ephemeral: true });
            return;
        }

        try {
            const result = await client.economy.claimDaily(interaction.user.id, interaction.guildId!);

            const streakText = result.isStreak
                ? `🔥 **${result.streak} day streak!** (+${(result.streak - 1) * 25} bonus coins)`
                : `🌟 **Streak started!** Keep claiming daily to earn bonus coins.`;

            const embed = new EmbedBuilder()
                .setTitle("🎁 Daily Reward Claimed!")
                .setColor("#57F287")
                .setThumbnail(interaction.user.displayAvatarURL())
                .addFields(
                    { name: "Coins Earned", value: `🪙 **+${result.coins.toLocaleString()}** coins`, inline: true },
                    { name: "Streak", value: `🔥 Day **${result.streak}**`, inline: true },
                    { name: "Next Claim", value: `<t:${Math.floor(result.nextClaim.getTime() / 1000)}:R>`, inline: true },
                    { name: "Streak Status", value: streakText }
                )
                .setFooter({ text: "R3NDER Economy • Claim again in 24 hours!" })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error: any) {
            const embed = new EmbedBuilder()
                .setTitle("⏰ Already Claimed")
                .setColor("#ED4245")
                .setDescription(error.message)
                .setFooter({ text: "R3NDER Economy" });
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};

export default daily;

import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { R3NDERClient } from "../../client/R3nderClient";
import { Command } from "../../types/index";

const balance: Command = {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check your coin balance")
        .addUserOption(o =>
            o.setName("user").setDescription("User to check balance for (optional)")),
    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const target = interaction.options.getUser("user") ?? interaction.user;
        const rateLimitKey = `balance:${interaction.user.id}`;
        if (!client.ratelimit.check(rateLimitKey, 3, 10000)) {
            await interaction.reply({ content: "⚠️ Please slow down!", ephemeral: true });
            return;
        }

        try {
            const coins = await client.economy.getBalance(target.id, interaction.guildId!);
            const embed = new EmbedBuilder()
                .setTitle("💰 Coin Balance")
                .setColor("#F1C40F")
                .setThumbnail(target.displayAvatarURL())
                .addFields(
                    { name: "User", value: `<@${target.id}>`, inline: true },
                    { name: "Balance", value: `🪙 **${coins.toLocaleString()}** coins`, inline: true }
                )
                .setFooter({ text: "R3NDER Economy System" })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error: unknown) {
            await interaction.reply({ content: "❌ Error fetching balance.", ephemeral: true });
        }
    },
};

export default balance;

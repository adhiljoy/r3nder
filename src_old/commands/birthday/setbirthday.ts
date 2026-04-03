import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { R3NDERClient } from "../../client/R3nderClient";
import { Command } from "../../types/index";
import { User } from "../../database/shared/User";

const setbirthday: Command = {
    data: new SlashCommandBuilder()
        .setName("setbirthday").setDescription("Set your birthday for an auto-wish")
        .addIntegerOption(o => o.setName("day").setDescription("Day of your birthday").setRequired(true))
        .addIntegerOption(o => o.setName("month").setDescription("Month (1-12)").setRequired(true)),
    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const day = interaction.options.getInteger("day", true);
        const month = interaction.options.getInteger("month", true);
        if (day < 1 || day > 31 || month < 1 || month > 12) {
            await interaction.reply({ content: "❌ Invalid date.", ephemeral: true });
            return;
        }
        try {
            const birthday = new Date();
            birthday.setMonth(month - 1);
            birthday.setDate(day);
            await User.findOneAndUpdate(
                { userId: interaction.user.id, guildId: interaction.guildId },
                { birthday }, { upsert: true }
            );
            await interaction.reply({ content: `🎂 Birthday set to **${day}/${month}**!` });
        } catch (error: unknown) {
            await interaction.reply({ content: "❌ Error setting birthday.", ephemeral: true });
        }
    },
};
export default setbirthday;

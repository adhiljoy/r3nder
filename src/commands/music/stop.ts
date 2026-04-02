import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { R3NDERClient } from "../../client/R3nderClient";
import { Command } from "../../types/index";

const stop: Command = {
    data: new SlashCommandBuilder().setName("stop").setDescription("Stop music and clear the queue"),
    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            await client.music.stop(interaction.guildId!);
            await interaction.reply({ content: "🛑 Stopped music and cleared the queue." });
        } catch (error: any) {
            await interaction.reply({ content: `❌ ${error.message}`, ephemeral: true });
        }
    },
};
export default stop;

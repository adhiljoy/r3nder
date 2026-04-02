import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import { Command } from "@appTypes/index";

const skip: Command = {
    data: new SlashCommandBuilder().setName("skip").setDescription("Skip the current song"),
    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            await client.music.skip(interaction.guildId!);
            await interaction.reply({ content: "⏭️ Skipped!" });
        } catch (error: any) {
            await interaction.reply({ content: `❌ ${error.message}`, ephemeral: true });
        }
    },
};
export default skip;

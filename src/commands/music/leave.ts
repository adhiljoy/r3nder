import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import { Command } from "@appTypes/index";

const leave: Command = {
    data: new SlashCommandBuilder()
        .setName("leave")
        .setDescription("Make the bot leave its current voice channel"),

    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const guildId = interaction.guildId!;

        try {
            await client.music.leave(guildId);

            const embed = new EmbedBuilder()
                .setTitle("📤 Left Voice Channel")
                .setDescription("Successfully left the voice channel.")
                .setColor("#EF4444")
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ I am not in a voice channel or failed to leave.", ephemeral: true });
        }
    },
};

export default leave;

import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import { Command } from "@appTypes/index";
import { LogType, LogPriority } from "@database/Log";

const leave: Command = {
    data: new SlashCommandBuilder()
        .setName("leave")
        .setDescription("Make the bot leave the voice channel"),

    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const guildId = interaction.guildId!;

        try {
            client.music.leave(guildId);

            const embed = new EmbedBuilder()
                .setTitle("📤 Disconnected")
                .setDescription("Successfully disconnected from the voice channel.")
                .setColor("#EF4444")
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Log event
            await client.logs.log({
                type: LogType.COMMAND,
                priority: LogPriority.INFO,
                guildId: guildId,
                userId: interaction.user.id,
                action: "VC_LEAVE",
                content: "Disconnected from voice channel.",
                metadata: {
                    manual: true
                }
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ An error occurred while trying to leave.", ephemeral: true });
        }
    },
};

export default leave;

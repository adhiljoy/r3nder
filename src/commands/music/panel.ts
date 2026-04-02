import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    GuildMember,
} from "discord.js";
import { R3NDERClient } from "../../client/R3nderClient";
import { Command } from "../../types/index";
import { buildPlayerEmbed, buildControlRow, buildStoppedEmbed } from "../../utils/MusicUI";

const panel: Command = {
    data: new SlashCommandBuilder()
        .setName("panel")
        .setDescription("🎛️ Open the interactive R3NDER Music Control Panel"),

    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const member = interaction.member as GuildMember;
        const guildId = interaction.guildId!;

        if (!member.voice.channel) {
            await interaction.reply({
                content: "❌ You must be in a voice channel to open the music panel.",
                ephemeral: true,
            });
            return;
        }

        await interaction.deferReply();

        const queue = client.music.getQueue(guildId);

        if (!queue || !queue.songs || queue.songs.length === 0) {
            await interaction.editReply({
                embeds: [buildStoppedEmbed()],
            });
            return;
        }

        const embed = buildPlayerEmbed(queue, interaction.guild?.name ?? "Server");
        const rows  = buildControlRow(queue.paused, queue.repeatMode ?? 0);

        await interaction.editReply({ embeds: [embed], components: rows });
    },
};

export default panel;

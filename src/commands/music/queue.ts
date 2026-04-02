import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import { Command } from "@appTypes/index";

const SONGS_PER_PAGE = 10;

const queue: Command = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Show the current music queue")
        .addIntegerOption(o =>
            o.setName("page").setDescription("Page number").setMinValue(1)),

    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const musicQueue = client.music.getQueue(interaction.guildId!);

        if (!musicQueue || !musicQueue.songs.length) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("📭 Queue is Empty")
                        .setColor("#ED4245")
                        .setDescription("No songs in the queue. Use `/play` to add music!")
                ],
                ephemeral: true
            });
            return;
        }

        const page = (interaction.options.getInteger("page") ?? 1) - 1;
        const songs = musicQueue.songs;
        const totalPages = Math.ceil(songs.length / SONGS_PER_PAGE);
        const currentPage = Math.min(page, totalPages - 1);
        const pageSongs = songs.slice(currentPage * SONGS_PER_PAGE, (currentPage + 1) * SONGS_PER_PAGE);

        const songList = pageSongs.map((s: any, i: any) => {
            const globalIndex = currentPage * SONGS_PER_PAGE + i;
            const prefix = globalIndex === 0 ? "▶️ **Now Playing**" : `**${globalIndex}.**`;
            return `${prefix} [${s.name}](${s.url}) — \`${s.formattedDuration}\`\n> Requested by ${s.user ?? "Unknown"}`;
        }).join("\n\n");

        const embed = new EmbedBuilder()
            .setTitle(`🎶 Music Queue — ${interaction.guild?.name}`)
            .setColor("#5865F2")
            .setDescription(songList)
            .addFields(
                { name: "Total Songs", value: `${songs.length}`, inline: true },
                { name: "Total Duration", value: musicQueue.formattedDuration, inline: true },
                { name: "Volume", value: `🔊 ${musicQueue.volume}%`, inline: true }
            )
            .setFooter({ text: `Page ${currentPage + 1} / ${totalPages} • R3NDER Music` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};

export default queue;

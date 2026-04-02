import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    GuildMember,
    TextChannel,
    Message,
} from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import { Command } from "@appTypes/index";
import { buildPlayerEmbed, buildControlRow } from "@utils/MusicUI";

const play: Command = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play a song in your voice channel")
        .addStringOption(o =>
            o.setName("query").setDescription("Song name or URL").setRequired(true)),

    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const query = interaction.options.getString("query", true);
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            await interaction.reply({ content: "❌ You must be in a voice channel!", ephemeral: true });
            return;
        }

        await interaction.deferReply();

        try {
            // Play the song
            await client.music.play(voiceChannel, query, member, interaction.channel as TextChannel);

            // Wait briefly for DisTube to populate the queue
            await new Promise(res => setTimeout(res, 1500));

            const queue = client.music.getQueue(interaction.guildId!);
            if (!queue) {
                await interaction.editReply({ content: `🎶 Added to queue: **${query}**` });
                return;
            }

            const embed = buildPlayerEmbed(queue, interaction.guild!.name);
            const rows = buildControlRow(queue.paused);

            const playerMsg: Message = await interaction.editReply({
                embeds: [embed],
                components: rows,
            }) as Message;

            // Cache the player message ID so buttons can update it
            client.cache.set(`music_msg:${interaction.guildId}`, playerMsg.id, 3600000);
            client.cache.set(`music_ch:${interaction.guildId}`, interaction.channelId, 3600000);

        } catch (error: any) {
            console.error("[Play Command Error]", error);
            await interaction.editReply({ content: `❌ Error: ${error.message}` });
        }
    },
};

export default play;

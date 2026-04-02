import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import { Command } from "@appTypes/index";
import { LogType, LogPriority } from "@database/Log";

const play: Command = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play a song from YouTube in your current voice channel")
        .addStringOption(option =>
            option.setName("query")
                .setDescription("The song name or URL to play")
                .setRequired(true)
        ),

    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const member = interaction.member as GuildMember;
        const channel = member.voice.channel;
        const query = interaction.options.getString("query", true);

        if (!channel) {
            await interaction.reply({ content: "❌ You must be in a voice channel for me to play music!", ephemeral: true });
            return;
        }

        await interaction.deferReply();

        try {
            const songName = await client.music.play(channel, query, interaction.user.id, interaction.channelId);

            const embed = new EmbedBuilder()
                .setTitle("🎵 Now Playing")
                .setDescription(`🎶 **${songName}**`)
                .setColor("#8B5CF6")
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Log event
            await client.logs.log({
                type: LogType.COMMAND,
                priority: LogPriority.INFO,
                guildId: interaction.guildId!,
                userId: interaction.user.id,
                action: "MUSIC_PLAY",
                content: `Started playing: ${songName}`,
                metadata: {
                    query: query,
                    songName: songName,
                    channelId: channel.id
                }
            });

        } catch (error: any) {
            console.error(error);
            await interaction.editReply({ content: `❌ I failed to play the song: ${error.message}` });
        }
    },
};

export default play;

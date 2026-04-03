"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Log_1 = require("../../database/shared/Log");
const play = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("play")
        .setDescription("Play a song from YouTube in your current voice channel")
        .addStringOption(option => option.setName("query")
        .setDescription("The song name or URL to play")
        .setRequired(true)),
    async execute(client, interaction) {
        const member = interaction.member;
        const channel = member.voice.channel;
        const query = interaction.options.getString("query", true);
        if (!channel) {
            await interaction.reply({ content: "❌ You must be in a voice channel for me to play music!", ephemeral: true });
            return;
        }
        await interaction.deferReply();
        try {
            const songName = await client.music.play(channel, query, interaction.user.id, interaction.channelId);
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("🎵 Now Playing")
                .setDescription(`🎶 **${songName}**`)
                .setColor("#8B5CF6")
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
            // Log event
            await client.logs.log({
                type: Log_1.LogType.COMMAND,
                priority: Log_1.LogPriority.INFO,
                guildId: interaction.guildId,
                userId: interaction.user.id,
                action: "MUSIC_PLAY",
                content: `Started playing: ${songName}`,
                metadata: {
                    query: query,
                    songName: songName,
                    channelId: channel.id
                }
            });
        }
        catch (error) {
            console.error(error);
            await interaction.editReply({ content: `❌ I failed to play the song: ${error.message}` });
        }
    },
};
exports.default = play;

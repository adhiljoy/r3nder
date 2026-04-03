"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const MusicUI_1 = require("../../utils/MusicUI");
const panel = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("panel")
        .setDescription("🎛️ Open the interactive R3NDER Music Control Panel"),
    async execute(client, interaction) {
        const member = interaction.member;
        const guildId = interaction.guildId;
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
                embeds: [(0, MusicUI_1.buildStoppedEmbed)()],
            });
            return;
        }
        const embed = (0, MusicUI_1.buildPlayerEmbed)(queue, interaction.guild?.name ?? "Server");
        const rows = (0, MusicUI_1.buildControlRow)(queue.paused, queue.repeatMode ?? 0);
        await interaction.editReply({ embeds: [embed], components: rows });
    },
};
exports.default = panel;

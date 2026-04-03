"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MUSIC_BTN = void 0;
exports.buildPlayerEmbed = buildPlayerEmbed;
exports.buildControlRow = buildControlRow;
exports.buildStoppedEmbed = buildStoppedEmbed;
exports.buildPlaylistEmbed = buildPlaylistEmbed;
const discord_js_1 = require("discord.js");
// ─── Button IDs ───────────────────────────────────────────────────────────────
exports.MUSIC_BTN = {
    BACK: "music_back",
    PAUSE: "music_pause",
    SKIP: "music_skip",
    VOL_UP: "music_vol_up",
    SHUFFLE: "music_shuffle",
    LOOP: "music_loop",
    STOP: "music_stop",
    AUTOPLAY: "music_autoplay",
    PLAYLIST: "music_playlist",
    VOL_DOWN: "music_vol_down",
};
// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildProgressBar(current, total, length = 22) {
    if (!total || total <= 0)
        return "`" + "──────────────────────" + "`";
    const pct = Math.min(current / total, 1);
    const filled = Math.round(pct * length);
    const bar = "▓".repeat(filled) + "░".repeat(length - filled);
    return `\`${bar}\``;
}
function formatSeconds(sec) {
    if (!sec || sec <= 0)
        return "0:00";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}
function loopLabel(mode) {
    if (mode === 1)
        return "🔂 Song";
    if (mode === 2)
        return "🔁 Queue";
    return "➡️ Off";
}
function sourceEmoji(source) {
    if (source === "soundcloud")
        return "🟠";
    if (source === "youtube")
        return "🔴";
    return "🎵";
}
// ─── Main Now-Playing Embed ───────────────────────────────────────────────────
function buildPlayerEmbed(queue, guildName) {
    const song = queue.songs[0];
    const isPaused = queue.paused;
    const duration = song.durationSec ?? 0;
    const current = queue.currentTime ?? 0;
    const progress = buildProgressBar(current, duration);
    const timeStr = `\`${formatSeconds(current)} / ${song.durationRaw ?? song.formattedDuration ?? "0:00"}\``;
    const srcEmoji = sourceEmoji(song.source);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(isPaused ? 0xFEE75C : 0x5865F2)
        .setAuthor({
        name: isPaused ? "⏸️  PAUSED — R3NDER Music" : `${srcEmoji}  MUSIC PANEL — R3NDER`,
        iconURL: "https://cdn.discordapp.com/emojis/1234567890.webp",
    })
        .setTitle(`${isPaused ? "⏸️" : "🎵"} ${song.name}`)
        .setURL(song.url)
        .setThumbnail(song.thumbnail ?? null)
        .addFields({
        name: "🎤  Artist",
        value: `\`${song.author ?? "Unknown Artist"}\``,
        inline: true,
    }, {
        name: "⏱️  Duration",
        value: `\`${song.durationRaw ?? song.formattedDuration ?? "0:00"}\``,
        inline: true,
    }, {
        name: "👤  Requested By",
        value: `${song.requestedBy ? `<@${song.requestedBy}>` : "Unknown"}`,
        inline: true,
    }, {
        name: "🔊  Volume",
        value: `\`${queue.volume}%\``,
        inline: true,
    }, {
        name: "🔁  Loop",
        value: loopLabel(queue.repeatMode),
        inline: true,
    }, {
        name: "📜  Queue",
        value: `\`${queue.songs.length} track(s)\``,
        inline: true,
    }, {
        name: `Progress  ${timeStr}`,
        value: progress,
    })
        .setFooter({ text: `${guildName} • Powered by R3NDER` })
        .setTimestamp();
    return embed;
}
// ─── Control Buttons (2 rows) ─────────────────────────────────────────────────
function buildControlRow(isPaused, loopMode = 0) {
    // Row 1 — playback controls
    const row1 = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(exports.MUSIC_BTN.BACK)
        .setEmoji("⏮️")
        .setLabel("Back")
        .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
        .setCustomId(exports.MUSIC_BTN.PAUSE)
        .setEmoji(isPaused ? "▶️" : "⏸️")
        .setLabel(isPaused ? "Resume" : "Pause")
        .setStyle(isPaused ? discord_js_1.ButtonStyle.Success : discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
        .setCustomId(exports.MUSIC_BTN.SKIP)
        .setEmoji("⏭️")
        .setLabel("Skip")
        .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
        .setCustomId(exports.MUSIC_BTN.VOL_UP)
        .setEmoji("🔊")
        .setLabel("Vol +")
        .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
        .setCustomId(exports.MUSIC_BTN.STOP)
        .setEmoji("⏹️")
        .setLabel("Stop")
        .setStyle(discord_js_1.ButtonStyle.Danger));
    // Row 2 — extras
    const row2 = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(exports.MUSIC_BTN.SHUFFLE)
        .setEmoji("🔀")
        .setLabel("Shuffle")
        .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
        .setCustomId(exports.MUSIC_BTN.LOOP)
        .setEmoji(loopMode === 0 ? "🔁" : loopMode === 1 ? "🔂" : "🔁")
        .setLabel(loopMode === 0 ? "Loop: Off" : loopMode === 1 ? "Loop: Song" : "Loop: Queue")
        .setStyle(loopMode > 0 ? discord_js_1.ButtonStyle.Success : discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
        .setCustomId(exports.MUSIC_BTN.VOL_DOWN)
        .setEmoji("🔉")
        .setLabel("Vol -")
        .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
        .setCustomId(exports.MUSIC_BTN.AUTOPLAY)
        .setEmoji("▶️")
        .setLabel("AutoPlay")
        .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
        .setCustomId(exports.MUSIC_BTN.PLAYLIST)
        .setEmoji("📜")
        .setLabel("Playlist")
        .setStyle(discord_js_1.ButtonStyle.Secondary));
    return [row1, row2];
}
// ─── Stopped Embed ────────────────────────────────────────────────────────────
function buildStoppedEmbed() {
    return new discord_js_1.EmbedBuilder()
        .setColor(0xED4245)
        .setTitle("⏹️  Music Stopped")
        .setDescription("The queue has been cleared.\nUse `/play <song>` to start a new session.")
        .setFooter({ text: "R3NDER Music • Ready when you are" })
        .setTimestamp();
}
// ─── Playlist / Queue Embed ───────────────────────────────────────────────────
function buildPlaylistEmbed(queue, guildName) {
    if (!queue || queue.songs.length === 0) {
        return new discord_js_1.EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle("📜  Queue is Empty")
            .setDescription("Add songs with `/play <song>`.")
            .setTimestamp();
    }
    const current = queue.songs[0];
    const upcoming = queue.songs.slice(1, 11); // Show up to 10 upcoming
    const upcomingStr = upcoming.length > 0
        ? upcoming.map((s, i) => `\`${i + 1}.\` **${s.name}** — \`${s.durationRaw ?? s.formattedDuration ?? "?"}\` · ${s.requestedBy ? `<@${s.requestedBy}>` : "?"}`).join("\n")
        : "*No more tracks queued.*";
    return new discord_js_1.EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle("📜  Queue")
        .addFields({
        name: "▶️  Now Playing",
        value: `**[${current.name}](${current.url})** — \`${current.durationRaw ?? current.formattedDuration ?? "?"}\``,
    }, {
        name: `🔢  Up Next (${upcoming.length} of ${queue.songs.length - 1})`,
        value: upcomingStr,
    })
        .setFooter({ text: `${guildName} • R3NDER Music` })
        .setTimestamp();
}

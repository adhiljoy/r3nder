import {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    MessageActionRowComponentBuilder,
} from "discord.js";
interface SimpleSong {
    name: string;
    url: string;
    thumbnail?: string;
    formattedDuration: string;
    user?: string;
    duration?: number;
}

interface SimpleQueue {
    paused: boolean;
    repeatMode?: number;
    volume: number;
    songs: SimpleSong[];
    currentTime: number;
}

export const MUSIC_BTN = {
    PAUSE:   "music_pause",
    SKIP:    "music_skip",
    STOP:    "music_stop",
    LOOP:    "music_loop",
    SHUFFLE: "music_shuffle",
    VOL_UP:  "music_vol_up",
    VOL_DOWN:"music_vol_down",
} as const;

/** Build a progress bar string */
function buildProgressBar(current: number, total: number, length = 20): string {
    if (!total || total <= 0) return "▬".repeat(length);
    const progress = Math.round((current / total) * length);
    return "🔵" + "▬".repeat(Math.max(0, progress - 1)) + "▬".repeat(Math.max(0, length - progress));
}

/** Build the "Now Playing" embed from the queue state */
export function buildPlayerEmbed(queue: SimpleQueue, guildName: string): EmbedBuilder {
    const song = queue.songs[0];
    const isPaused = queue.paused;
    const isLooping = queue.repeatMode === 1;
    const volume = queue.volume;
    const queueLength = queue.songs.length;

    const progressBar = buildProgressBar(
        queue.currentTime,
        song.duration ?? 0
    );

    return new EmbedBuilder()
        .setTitle(isPaused ? "⏸️ Paused" : "🎵 Now Playing")
        .setColor(isPaused ? "#FEE75C" : "#5865F2")
        .setDescription(`**[${song.name}](${song.url})**`)
        .setThumbnail(song.thumbnail ?? null)
        .addFields(
            { name: "Duration",      value: `\`${song.formattedDuration}\``,              inline: true },
            { name: "Requested by",  value: `${song.user ?? "Unknown"}`,                  inline: true },
            { name: "Volume",        value: `🔊 ${volume}%`,                              inline: true },
            { name: "Queue",         value: `${queueLength} song(s) in queue`,            inline: true },
            { name: "Loop",          value: isLooping ? "🔁 Song Loop ON" : "➡️ No Loop", inline: true },
            { name: "Progress",      value: progressBar }
        )
        .setFooter({ text: `${guildName} • R3NDER Music` })
        .setTimestamp();
}

/** Build the control button row */
export function buildControlRow(isPaused: boolean): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
    const row1 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(MUSIC_BTN.PAUSE)
            .setLabel(isPaused ? "▶️ Resume" : "⏸️ Pause")
            .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(MUSIC_BTN.SKIP)
            .setLabel("⏭️ Skip")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(MUSIC_BTN.STOP)
            .setLabel("⏹️ Stop")
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId(MUSIC_BTN.LOOP)
            .setLabel("🔁 Loop")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(MUSIC_BTN.SHUFFLE)
            .setLabel("🔀 Shuffle")
            .setStyle(ButtonStyle.Secondary),
    );

    const row2 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(MUSIC_BTN.VOL_DOWN)
            .setLabel("🔉 Vol -10")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(MUSIC_BTN.VOL_UP)
            .setLabel("🔊 Vol +10")
            .setStyle(ButtonStyle.Secondary),
    );

    return [row1, row2];
}

/** Build a "stopped / no music" embed */
export function buildStoppedEmbed(): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle("⏹️ Music Stopped")
        .setColor("#ED4245")
        .setDescription("The queue has ended or music was stopped.\nUse `/play` to start again!")
        .setTimestamp();
}

import { createAudioResource, AudioPlayerStatus, AudioResource } from "@discordjs/voice";
import { VoiceBasedChannel } from "discord.js";
import play from "play-dl";
import ytdl from "@distube/ytdl-core";
import ffmpeg from "ffmpeg-static";
import { R3NDERClient } from "../client/R3nderClient";
import { VoiceManager, GuildVoiceState, Track } from "./VoiceManager";
import { LogType, LogPriority } from "../database/shared/Log";
import { MusicEventType } from "../database/shared/MusicLog";

import path from "path";
import { execSync, spawn } from "child_process";
import { Readable, PassThrough } from "stream";
import fs from "fs";

// Configure ffmpeg path globally for the process
if (ffmpeg) {
    const ffmpegDir = path.dirname(ffmpeg);
    if (!process.env.PATH?.includes(ffmpegDir)) {
        process.env.PATH = `${ffmpegDir}${path.delimiter}${process.env.PATH}`;
    }
    process.env.FFMPEG_PATH = ffmpeg;
    process.env.FFMPEG_BIN = ffmpeg;
    (global as any).FFMPEG_PATH = ffmpeg;

    try {
        const version = execSync("ffmpeg -version").toString().split("\n")[0];
        console.log(`[R3NDER Kernel] FFMPEG detected: ${version}`);
    } catch (err) {
        console.error("[R3NDER Kernel] FFMPEG detection failed in process PATH.");
    }
}

export class MusicService {
    private client: R3NDERClient;
    private voiceManager: VoiceManager;
    private metrics = {
        retries: 0,
        fallbacks: 0,
        failures: 0
    };

    private scReady: boolean = false;
    private scInitPromise: Promise<void>;

    constructor(client: R3NDERClient, voiceManager: VoiceManager) {
        this.client = client;
        this.voiceManager = voiceManager;
        
        // Register this service globally for the VoiceManager bridge
        (global as any).r3nderMusicService = this;

        // Initialize SoundCloud bit-buffer
        this.scInitPromise = play.getFreeClientID().then((id: string) => {
            play.setToken({
                soundcloud: {
                    client_id: id
                }
            });
            this.scReady = true;
            console.log(`[R3NDER Kernel] SoundCloud Engine Ready | CID: ${id.substring(0, 8)}...`);
        }).catch(err => {
            console.error("[R3NDER Kernel] SoundCloud Initialization Failed:", err);
        });
    }

    private async createStream(url: string, retryCount = 0): Promise<{ stream: Readable, type: any }> {
        try {
            if (!url) throw new Error("Missing Stream URL");

            // --- PRIORITY 1: SOUNDCLOUD ---
            if (url.includes("soundcloud.com")) {
                const source = await play.stream(url);
                if (source.stream) {
                    await this.client.logs.log({
                        type: LogType.MUSIC, priority: LogPriority.INFO,
                        action: "SOURCE_USED", content: `SoundCloud active: ${url}`
                    }).catch(() => {});
                    return { stream: source.stream, type: source.type };
                }
            }

            // --- PRIORITY 2: DIRECT AUDIO URLS / RADIO ---
            if (url.match(/\.(mp3|wav|flac|ogg|m4a|aac)$/) || url.includes("radio") || url.includes("stream")) {
                await this.client.logs.log({
                    type: LogType.MUSIC, priority: LogPriority.INFO,
                    action: "SOURCE_USED", content: `Direct Stream active: ${url}`
                }).catch(() => {});
                
                // Directly pass to ffmpeg-based decoder via discordjs/voice
                const { stream } = (await play.stream(url)) as any;
                if (stream) return { stream, type: "arbitrary" };
                
                // Fallback direct fetch
                const response = await fetch(url);
                if (response.ok && response.body) {
                    return { stream: Readable.fromWeb(response.body as any), type: "arbitrary" };
                }
            }

            // --- PRIORITY 3: YOUTUBE (FALLBACK ONLY) ---
            if (url.includes("youtube.com") || url.includes("youtu.be")) {
                const ytDlpPath = path.join(process.cwd(), "yt-dlp.exe");
                if (fs.existsSync(ytDlpPath)) {
                    const ytDlpProcess = spawn(ytDlpPath, [
                        "-o", "-", "-f", "bestaudio/best",
                        "--buffer-size", "16K", "--no-playlist", url
                    ]);
                    const stream = new PassThrough();
                    ytDlpProcess.stdout.pipe(stream);
                    
                    await this.client.logs.log({
                        type: LogType.MUSIC, priority: LogPriority.WARN,
                        action: "FALLBACK_TRIGGERED", content: `YouTube Fallback active: ${url}`
                    }).catch(() => {});

                    return { stream, type: "arbitrary" };
                }

                // play-dl youtube fallback
                const source = await play.stream(url, { discordPlayerCompatibility: true });
                if (source.stream) return { stream: source.stream, type: source.type };
            }

            throw new Error("No priority source available for this URL.");
        } catch (error: any) {
            await this.client.logs.log({
                type: LogType.MUSIC, priority: LogPriority.ERROR,
                action: "SOURCE_FAIL", content: `Stream extraction failed: ${url}`,
                metadata: { error: error.message }
            }).catch(() => {});

            if (retryCount < 1) {
                this.metrics.retries++;
                return this.createStream(url, retryCount + 1);
            }
            throw error;
        }
    }

    public async join(channel: VoiceBasedChannel): Promise<void> {
        await this.voiceManager.joinChannel(channel.guild.id, channel);
    }

    public leave(guildId: string): void {
        this.voiceManager.destroy(guildId);
    }

    // textChannelId: the Discord text channel where the panel should live
    public async play(channel: VoiceBasedChannel, query: string, userId: string, textChannelId?: string): Promise<string> {
        const state = await this.voiceManager.joinChannel(channel.guild.id, channel);
        
        let video: any;
        let source_type: any = "soundcloud";
        
        // --- SMART DETECTION BLOCK ---
        if (query.startsWith("http")) {
            // SOUNDCLOUD DIRECT
            if (query.includes("soundcloud.com")) {
                const so_info = await play.soundcloud(query) as any;
                video = {
                    title: so_info.name || so_info.title,
                    url: so_info.url,
                    thumbnails: [{ url: so_info.thumbnail }],
                    durationRaw: so_info.durationRaw,
                    durationInSec: so_info.durationInSec,
                    channel: { name: so_info.user?.name || "SoundCloud Artist" }
                };
                source_type = "soundcloud";
            } 
            // SPOTIFY CONVERSION (Convert to SoundCloud Search)
            else if (query.includes("spotify.com")) {
                const sp_data = await play.spotify(query) as any;
                const searchStr = `${sp_data.name} ${sp_data.artists?.[0]?.name || ""}`;
                const searchRes = await play.search(searchStr, { limit: 1, source: { soundcloud: "tracks" } });
                if (searchRes.length > 0) {
                    video = searchRes[0];
                    source_type = "soundcloud";
                } else {
                    // Fallback to youtube search if soundcloud search fails
                    const ytRes = await play.search(searchStr, { limit: 1 });
                    if (ytRes.length === 0) throw new Error("Could not find Spotify track on any source.");
                    video = ytRes[0];
                    source_type = "youtube";
                }
            }
            // DIRECT MP3/RADIO
            else if (query.match(/\.(mp3|wav|flac|ogg|m4a|aac)$/) || query.includes("stream") || query.includes("radio")) {
                video = {
                    title: query.split("/").pop() || "Direct Audio Stream",
                    url: query,
                    thumbnails: [{ url: "https://r3nder.app/assets/audio-source.png" }],
                    durationRaw: "Live", durationInSec: 0,
                    channel: { name: "External Stream" }
                };
                source_type = "direct";
            }
            // YOUTUBE DIRECT
            else if (query.includes("youtube.com") || query.includes("youtu.be")) {
                const yt_info = await play.video_info(query);
                video = yt_info.video_details;
                source_type = "youtube";
            }
            else {
                throw new Error("Unsupported URL source. Please use SoundCloud, YouTube, or direct audio link.");
            }
        } 
        // --- TEXT QUERY (PRIORITIZE SOUNDCLOUD) ---
        else {
            console.log(`[R3NDER Kernel] Text Query detected: "${query}".`);
            
            // Wait for SoundCloud to be ready if not already
            if (!this.scReady) {
                console.log("[R3NDER Kernel] SoundCloud not ready yet, waiting...");
                await this.scInitPromise;
            }

            console.log(`[R3NDER Kernel] Searching SoundCloud...`);
            try {
                const searchRes = await play.search(query, { limit: 1, source: { soundcloud: "tracks" } });
                if (searchRes.length > 0) {
                    console.log(`[R3NDER Kernel] SoundCloud Result Found: ${(searchRes[0] as any).name || (searchRes[0] as any).title}`);
                    video = searchRes[0];
                    source_type = "soundcloud";
                } else {
                    console.log(`[R3NDER Kernel] SoundCloud search yielded zero results. Trying yt-dlp for SoundCloud search...`);
                    try {
                        const scSearchUrl = await this.ytDlpSearch(`scsearch1:${query}`);
                        if (scSearchUrl) {
                            console.log(`[R3NDER Kernel] yt-dlp found SoundCloud track: ${scSearchUrl}`);
                            const scRes = await play.soundcloud(scSearchUrl);
                            video = scRes as any;
                            source_type = "soundcloud";
                        } else {
                            throw new Error("yt-dlp SC search failed");
                        }
                    } catch (scErr) {
                        console.log(`[R3NDER Kernel] yt-dlp SoundCloud search failed. Falling back to YouTube search...`);
                        const ytRes = await play.search(query, { limit: 1 });
                        if (ytRes.length === 0) throw new Error("No results found for your query.");
                        video = ytRes[0];
                        source_type = "youtube";
                    }
                }
            } catch (err) {
                console.error(`[R3NDER Kernel] SoundCloud Search Error:`, err);
                console.log(`[R3NDER Kernel] Falling back to YouTube search...`);
                const ytRes = await play.search(query, { limit: 1 });
                if (ytRes.length === 0) throw new Error("No results found for your query.");
                video = ytRes[0];
                source_type = "youtube";
            }
        }

        const track: Track = {
            name: (video as any).name || (video as any).title || "Unknown",
            author: (video as any).channel?.name || (video as any).author?.name || (video as any).user?.name || "Unknown Artist",
            url: video.url,
            thumbnail: (video as any).thumbnails?.[0]?.url || (video as any).thumbnail?.url || (video as any).user?.avatar_url,
            durationRaw: video.durationRaw || "0:00",
            durationSec: video.durationInSec || 0,
            requestedBy: userId,
            source: source_type
        };

        state.queue.push(track);

        // ── Auto-register panel channel (once per guild) ──────────────────────
        if (textChannelId && !this.client.panel.hasPanel(channel.guild.id)) {
            await this.client.panel.autoRegister(channel.guild.id, textChannelId);
        }

        // Log QUEUE_ADD event
        const username = await this.client.users.fetch(userId).then(u => u.username).catch(() => "Unknown");
        this.client.logs.logMusic({
            guildId:     channel.guild.id,
            userId,
            username,
            event:       MusicEventType.QUEUE_ADD,
            trackTitle:  track.name,
            trackUrl:    track.url,
            trackAuthor: track.author,
            source:      track.source,
            duration:    track.durationSec,
        }).catch(() => {});

        // If not playing, start immediately
        if (state.player.state.status === AudioPlayerStatus.Idle) {
            await this.playTrack(channel.guild.id, track);
        } else {
            // Already playing — update panel to show new queue length
            this.client.panel.refresh(channel.guild.id).catch(() => {});
        }
        
        return track.name;
    }

    public async playNext(guildId: string, causedByError = false): Promise<void> {
        const state = this.voiceManager.getState(guildId);
        if (!state) return;

        // Remote finished track
        state.queue.shift();

        if (state.queue.length > 0) {
            const nextTrack = state.queue[0];
            await this.playTrack(guildId, nextTrack);
        } else {
            // Optionally leave after timeout if idle
        }
    }

    private async playTrack(guildId: string, track: Track): Promise<void> {
        const state = this.voiceManager.getState(guildId);
        if (!state) return;

        try {
            const { stream, type } = await this.createStream(track.url);
            
            // HEARTBEAT VALIDATION
            if (!stream) throw new Error("Audio stream bit-buffer is empty.");
            
            const resource = createAudioResource(stream, {
                inputType: type,
                inlineVolume: true
            });
            
            // AUDIBILITY CORRECTION: Force volume gain to 100% (1.0)
            if (resource.volume) {
                resource.volume.setVolume(1);
            }

            // RESOURCE INSTRUMENTATION: Track lifecycle events
            resource.playStream.on("error", (err: any) => {
                console.error(`[R3NDER Kernel] Resource Stream ERROR: ${err.message}`);
            });

            // TELEMETRY: AUDIO_START execution
            state.player.once(AudioPlayerStatus.Playing, () => {
                console.log(`[R3NDER Kernel] AUDIO_START: ${track.name} on Guild: ${guildId}`);
                this.client.logs.log({
                    type: LogType.MUSIC,
                    priority: LogPriority.INFO,
                    action: "AUDIO_START",
                    content: `Sonic session active: ${track.name}`,
                    metadata: { guildId, track: track.url, type }
                }).catch(() => {});

                // Log to dedicated music_logs collection
                this.client.logs.logMusic({
                    guildId,
                    userId:      track.requestedBy || "system",
                    username:    "System",
                    event:       MusicEventType.MUSIC_PLAY,
                    trackTitle:  track.name,
                    trackUrl:    track.url,
                    trackAuthor: track.author,
                    source:      track.source,
                    duration:    track.durationSec,
                }).catch(() => {});

                // ── Auto-update the persistent music panel ────────────────────
                this.client.panel.refresh(guildId).catch(() => {});
            });

            this.voiceManager.play(guildId, resource, track);
        } catch (error: any) {
            // TELEMETRY: AUDIO_FAIL execution
            await this.client.logs.log({
                type: LogType.MUSIC,
                priority: LogPriority.ERROR,
                action: "AUDIO_FAIL",
                content: `Sonic session failed: ${track.name}`,
                metadata: { error: error.message }
            }).catch(() => {});

            console.error(`[MusicService] AUDIO_FAIL for ${track.name}:`, error.message);
            await this.playNext(guildId, true);
        }
    }

    public stop(guildId: string): void {
        const state = this.voiceManager.getState(guildId);
        const track = state?.queue[0];
        if (track) {
            this.client.logs.logMusic({
                guildId,
                userId:      "system",
                username:    "System",
                event:       MusicEventType.MUSIC_STOP,
                trackTitle:  track.name,
                trackUrl:    track.url,
                trackAuthor: track.author,
                source:      track.source,
            }).catch(() => {});
        }
        this.voiceManager.stop(guildId);
        // Collapse panel to stopped UI
        this.client.panel.destroy(guildId).catch(() => {});
    }

    public pause(guildId: string): void {
        const state = this.voiceManager.getState(guildId);
        const track = state?.queue[0];
        if (track) {
            this.client.logs.logMusic({
                guildId,
                userId:      "system",
                username:    "System",
                event:       MusicEventType.MUSIC_PAUSE,
                trackTitle:  track.name,
                trackUrl:    track.url,
                trackAuthor: track.author,
                source:      track.source,
            }).catch(() => {});
        }
        this.voiceManager.pause(guildId);
        setTimeout(() => this.client.panel.refresh(guildId).catch(() => {}), 200);
    }

    public resume(guildId: string): void {
        const state = this.voiceManager.getState(guildId);
        const track = state?.queue[0];
        if (track) {
            this.client.logs.logMusic({
                guildId,
                userId:      "system",
                username:    "System",
                event:       MusicEventType.MUSIC_RESUME,
                trackTitle:  track.name,
                trackUrl:    track.url,
                trackAuthor: track.author,
                source:      track.source,
            }).catch(() => {});
        }
        this.voiceManager.resume(guildId);
        setTimeout(() => this.client.panel.refresh(guildId).catch(() => {}), 200);
    }

    public skip(guildId: string): void {
        const state = this.voiceManager.getState(guildId);
        const track = state?.queue[0];
        if (track) {
            this.client.logs.logMusic({
                guildId,
                userId:      "system",
                username:    "System",
                event:       MusicEventType.MUSIC_SKIP,
                trackTitle:  track.name,
                trackUrl:    track.url,
                trackAuthor: track.author,
                source:      track.source,
            }).catch(() => {});
        }
        this.voiceManager.stop(guildId); // stop(true) triggers Idle -> playNext
        // Panel refreshes automatically when playNext fires AUDIO_START
    }

    public setVolume(guildId: string, volume: number): void {
        const state = this.voiceManager.getState(guildId);
        const track = state?.queue[0];
        if (track) {
            this.client.logs.logMusic({
                guildId,
                userId:      "system",
                username:    "System",
                event:       MusicEventType.VOLUME_CHANGE,
                trackTitle:  track.name,
                trackUrl:    track.url,
                trackAuthor: track.author,
                source:      track.source,
                volume,
            }).catch(() => {});
        }
        this.voiceManager.setVolume(guildId, volume);
        setTimeout(() => this.client.panel.refresh(guildId).catch(() => {}), 200);
    }

    public shuffle(guildId: string): void {
        const state = this.voiceManager.getState(guildId);
        if (state && state.queue.length > 1) {
            const songs = state.queue.slice(1);
            for (let i = songs.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [songs[i], songs[j]] = [songs[j], songs[i]];
            }
            state.queue = [state.queue[0], ...songs];
            this.client.panel.refresh(guildId).catch(() => {});
        }
    }

    public toggleLoop(guildId: string): void {
        const state = this.voiceManager.getState(guildId) as any;
        if (!state) return;
        // Cycle: 0 = off, 1 = song, 2 = queue
        const current = state.repeatMode ?? 0;
        state.repeatMode = (current + 1) % 3;
        this.client.panel.refresh(guildId).catch(() => {});
    }

    public getMetrics() {
        return this.metrics;
    }

    public getStatus(guildId: string): any {
        const state = this.voiceManager.getState(guildId);
        if (!state || state.queue.length === 0) return null;
        
        const progressInMs = state.currentResource?.playbackDuration || 0;
        const progressInSec = Math.floor(progressInMs / 1000);

        return {
            playing: state.player.state.status !== AudioPlayerStatus.Idle,
            paused: state.player.state.status === AudioPlayerStatus.Paused,
            volume: state.currentResource?.volume?.volume ? Math.round(state.currentResource.volume.volume * 100) : 100,
            songs: state.queue,
            currentTime: progressInSec,
            formattedDuration: state.queue[0]?.durationRaw || "0:00",
            metrics: this.metrics
        };
    }

    public getQueue(guildId: string): any {
        return this.getStatus(guildId);
    }

    private async ytDlpSearch(query: string): Promise<string | null> {
        return new Promise((resolve) => {
            const child = spawn(path.join(process.cwd(), "yt-dlp.exe"), [
                "--get-url",
                "--flat-playlist",
                "--print", "webpage_url",
                query
            ]);

            let output = "";
            child.stdout.on("data", (data) => {
                output += data.toString();
            });

            child.on("close", () => {
                const url = output.trim().split("\n")[0];
                resolve(url || null);
            });
        });
    }
}

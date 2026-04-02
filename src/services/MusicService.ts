import { createAudioResource, AudioPlayerStatus, AudioResource } from "@discordjs/voice";
import { VoiceBasedChannel } from "discord.js";
import play from "play-dl";
import ytdl from "ytdl-core";
import ffmpeg from "ffmpeg-static";
import { R3NDERClient } from "../client/R3nderClient";
import { VoiceManager, GuildVoiceState, Track } from "./VoiceManager";
import { LogType, LogPriority } from "@database/Log";

import path from "path";
import { execSync } from "child_process";
import { Readable } from "stream";

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

    constructor(client: R3NDERClient, voiceManager: VoiceManager) {
        this.client = client;
        this.voiceManager = voiceManager;
        
        // Register this service globally for the VoiceManager bridge
        (global as any).r3nderMusicService = this;
    }

    private async createStream(url: string, retryCount = 0): Promise<{ stream: Readable, type: any }> {
        try {
            // Check if URL is valid
            if (!url) throw new Error("Missing Stream URL");

            // --- TRY PLAY-DL ---
            try {
                const source = await play.stream(url, { 
                    discordPlayerCompatibility: true,
                    // YouTube fixes
                    quality: 2
                });
                
                // Validate stream is readable
                if (!source.stream) throw new Error("play-dl stream empty");
                return { stream: source.stream, type: source.type };
            } catch (err: any) {
                if (retryCount < 2) {
                    this.metrics.retries++;
                    await this.client.logs.log({
                        type: LogType.MUSIC,
                        priority: LogPriority.WARN,
                        action: "RETRY_ATTEMPT",
                        content: `Retrying stream (${retryCount + 1}/2): ${url}`,
                        metadata: { error: err.message }
                    });
                    return this.createStream(url, retryCount + 1);
                }
                throw err; // Pass to fallback
            }
        } catch (error: any) {
            // --- FALLBACK: YTDL-CORE ---
            try {
                this.metrics.fallbacks++;
                await this.client.logs.log({
                    type: LogType.MUSIC,
                    priority: LogPriority.WARN,
                    action: "FALLBACK_USED",
                    content: `Falling back to ytdl-core for: ${url}`,
                    metadata: { error: error.message }
                });

                const stream = ytdl(url, { 
                    filter: "audioonly", 
                    highWaterMark: 1 << 25,
                    quality: "highestaudio"
                });
                return { stream, type: "arbitrary" };
            } catch (fallbackError: any) {
                this.metrics.failures++;
                await this.client.logs.log({
                    type: LogType.MUSIC,
                    priority: LogPriority.ERROR,
                    action: "STREAM_FAIL",
                    content: `FATAL: All stream extractors failed for: ${url}`,
                    metadata: { playDl: error.message, ytdl: fallbackError.message }
                });
                throw new Error("Unable to extract playable audio stream from any source.");
            }
        }
    }

    public async join(channel: VoiceBasedChannel): Promise<void> {
        await this.voiceManager.joinChannel(channel.guild.id, channel);
    }

    public leave(guildId: string): void {
        this.voiceManager.destroy(guildId);
    }

    public async play(channel: VoiceBasedChannel, query: string, userId: string): Promise<string> {
        const state = await this.voiceManager.joinChannel(channel.guild.id, channel);
        
        let video;
        let source_type: any = "youtube";
        
        if (query.startsWith("http")) {
            const yt_info = await play.video_info(query);
            video = yt_info.video_details;
        } else {
            const yt_info = await play.search(query, { limit: 1 });
            if (yt_info.length === 0) throw new Error("No results found for your query.");
            video = yt_info[0];
        }

        const track: Track = {
            name: video.title || "Unknown",
            url: video.url,
            thumbnail: (video as any).thumbnails?.[0]?.url || (video as any).thumbnail?.url,
            durationRaw: video.durationRaw || "0:00",
            durationSec: video.durationInSec || 0,
            requestedBy: userId,
            source: source_type
        };

        state.queue.push(track);

        // If not playing, start immediately
        if (state.player.state.status === AudioPlayerStatus.Idle) {
            await this.playTrack(channel.guild.id, track);
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
            const resource = createAudioResource(stream, {
                inputType: type,
                inlineVolume: true
            });
            
            this.voiceManager.play(guildId, resource, track);
        } catch (error: any) {
            // Auto skip on fatal stream error
            console.error(`[MusicService] Failed to play ${track.name}:`, error.message);
            await this.playNext(guildId, true);
        }
    }

    public stop(guildId: string): void {
        this.voiceManager.stop(guildId);
    }

    public pause(guildId: string): void {
        this.voiceManager.pause(guildId);
    }

    public resume(guildId: string): void {
        this.voiceManager.resume(guildId);
    }

    public skip(guildId: string): void {
        this.voiceManager.stop(guildId); // stop(true) triggers Idle -> playNext
    }

    public setVolume(guildId: string, volume: number): void {
        this.voiceManager.setVolume(guildId, volume);
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
        }
    }

    public toggleLoop(guildId: string): void {
        // Implementation for loop modes (off, song, queue)
    }

    public getMetrics() {
        return this.metrics;
    }

    public getQueue(guildId: string): any {
        const state = this.voiceManager.getState(guildId);
        if (!state || state.queue.length === 0) return null;
        
        return {
            paused: state.player.state.status === AudioPlayerStatus.Paused,
            volume: 100,
            songs: state.queue,
            currentTime: 0,
            formattedDuration: state.queue[0]?.durationRaw || "0:00"
        };
    }
}

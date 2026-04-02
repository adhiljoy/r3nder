import { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus, 
    VoiceConnection, 
    AudioPlayer,
    AudioResource,
    VoiceConnectionStatus,
    entersState
} from "@discordjs/voice";
import { VoiceBasedChannel } from "discord.js";

export interface Track {
    name: string;
    url: string;
    thumbnail?: string;
    durationRaw: string;
    durationSec: number;
    requestedBy: string;
    source: "youtube" | "soundcloud" | "spotify";
}

export interface GuildVoiceState {
    connection: VoiceConnection;
    player: AudioPlayer;
    currentResource?: AudioResource;
    currentTrack?: Track;
    queue: Track[];
    channelId: string;
}

export class VoiceManager {
    private states: Map<string, GuildVoiceState> = new Map();

    public async joinChannel(guildId: string, channel: VoiceBasedChannel): Promise<GuildVoiceState> {
        const existing = this.states.get(guildId);
        
        if (existing && existing.channelId === channel.id) {
            return existing;
        }

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guildId,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        
        // --- RESILIENCY HANDLERS ---
        player.on(AudioPlayerStatus.Idle, () => {
            const state = this.states.get(guildId);
            if (state && state.queue.length > 0) {
                // Trigger next song through the service
                this.playNext(guildId);
            }
        });

        player.on("error", (error) => {
            console.error(`[Player Error] Guild ${guildId}:`, error.message);
            // Log to cluster
            this.playNext(guildId, true); // True = skip with error
        });

        connection.subscribe(player);

        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5000),
                ]);
            } catch (error) {
                this.leaveChannel(guildId);
            }
        });

        const state: GuildVoiceState = {
            connection,
            player,
            queue: [],
            channelId: channel.id
        };

        this.states.set(guildId, state);
        return state;
    }

    public leaveChannel(guildId: string): void {
        const state = this.states.get(guildId);
        if (state) {
            state.player.stop();
            state.connection.destroy();
            this.states.delete(guildId);
        }
    }

    public destroy(guildId: string): void {
        this.leaveChannel(guildId);
    }

    public getState(guildId: string): GuildVoiceState | undefined {
        return this.states.get(guildId);
    }

    private async playNext(guildId: string, causedByError = false): Promise<void> {
        const state = this.states.get(guildId);
        if (!state || state.queue.length === 0) {
            this.stop(guildId);
            return;
        }

        // Logic here is typically handled by MusicService to create the actual stream
        // But we need a bridge. We'll use an event or a deferred method.
        // For simplicity, we trigger the MusicService playNext.
        // @ts-ignore (Assumes MusicService is connected or will handle)
        global.r3nderMusicService?.playNext(guildId, causedByError);
    }

    public play(guildId: string, resource: AudioResource, track: Track): void {
        const state = this.states.get(guildId);
        if (state) {
            state.currentTrack = track;
            state.currentResource = resource;
            state.player.play(resource);
        }
    }

    public pause(guildId: string): void {
        const state = this.states.get(guildId);
        if (state) {
            state.player.pause();
        }
    }

    public resume(guildId: string): void {
        const state = this.states.get(guildId);
        if (state) {
            state.player.unpause();
        }
    }

    public stop(guildId: string): void {
        const state = this.states.get(guildId);
        if (state) {
            state.player.stop(true);
            state.currentTrack = undefined;
            state.currentResource = undefined;
        }
    }

    public setVolume(guildId: string, volume: number): void {
        const state = this.states.get(guildId);
        if (state && state.currentResource?.volume) {
            state.currentResource.volume.setVolume(volume / 100);
        }
    }
}

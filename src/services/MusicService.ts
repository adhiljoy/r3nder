import { DisTube, Queue, Song, Events, RepeatMode } from "distube";
import { Client, GuildMember, VoiceBasedChannel, TextChannel, Message } from "discord.js";

export class MusicService {
    private distube: DisTube;

    constructor(client: Client) {
        this.distube = new DisTube(client, {
            emitNewSongOnly: true,
            emitAddSongWhenCreatingQueue: false,
            emitAddListWhenCreatingQueue: false,
        });

        this.setupEvents();
    }

    private setupEvents(): void {
        this.distube.on(Events.ERROR, (channel, error) => {
            if (channel && channel.isTextBased()) {
                (channel as TextChannel).send(`❌ Music error: ${error.message.slice(0, 2000)}`)
                    .catch((err: Error) => console.warn("[MusicService] Failed to send error:", err));
            }
            console.error("[MusicService Error]", error);
        });
    }

    public async join(channel: VoiceBasedChannel): Promise<void> {
        await this.distube.voices.join(channel);
    }

    public async leave(guildId: string): Promise<void> {
        await this.distube.voices.leave(guildId);
    }

    public async play(channel: VoiceBasedChannel, query: string, member: GuildMember, textChannel: TextChannel): Promise<void> {
        await this.distube.play(channel, query, { member, textChannel });
    }

    public async skip(guildId: string): Promise<Song> {
        const queue = this._getQueue(guildId);
        return await queue.skip();
    }

    public async stop(guildId: string): Promise<void> {
        const queue = this._getQueue(guildId);
        await queue.stop();
    }

    public pause(guildId: string): Queue {
        const queue = this._getQueue(guildId);
        queue.pause();
        return queue;
    }

    public resume(guildId: string): Queue {
        const queue = this._getQueue(guildId);
        queue.resume();
        return queue;
    }

    public setVolume(guildId: string, volume: number): Queue {
        const queue = this._getQueue(guildId);
        const clamped = Math.min(200, Math.max(0, volume));
        queue.setVolume(clamped);
        return queue;
    }

    public toggleLoop(guildId: string): { queue: Queue; mode: RepeatMode } {
        const queue = this._getQueue(guildId);
        const next = queue.repeatMode === RepeatMode.DISABLED
            ? RepeatMode.SONG
            : RepeatMode.DISABLED;
        queue.setRepeatMode(next);
        return { queue, mode: next };
    }

    public shuffle(guildId: string): Queue {
        const queue = this._getQueue(guildId);
        queue.shuffle();
        return queue;
    }

    public getQueue(guildId: string): Queue | undefined {
        return this.distube.getQueue(guildId);
    }

    // Throws a friendly error if no queue exists
    private _getQueue(guildId: string): Queue {
        const queue = this.distube.getQueue(guildId);
        if (!queue) throw new Error("No music is currently playing.");
        return queue;
    }

    public isPaused(guildId: string): boolean {
        const queue = this.distube.getQueue(guildId);
        return queue?.paused ?? false;
    }

    public getCurrentSong(guildId: string): Song | undefined {
        return this.distube.getQueue(guildId)?.songs[0];
    }
}

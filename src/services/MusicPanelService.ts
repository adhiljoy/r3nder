import {
    TextChannel,
    Message,
    EmbedBuilder,
} from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import {
    buildPlayerEmbed,
    buildControlRow,
    buildStoppedEmbed,
    SimpleQueue,
} from "@utils/MusicUI";

// ─── Per-guild panel state ────────────────────────────────────────────────────
interface PanelState {
    channelId:  string;
    messageId:  string | null;
    textChannel: TextChannel;
}

export class MusicPanelService {
    private client: R3NDERClient;
    // guildId → panel state
    private panels: Map<string, PanelState> = new Map();

    constructor(client: R3NDERClient) {
        this.client = client;
    }

    // ── Register the text channel where a guild wants its panel ───────────────
    public setChannel(guildId: string, channel: TextChannel): void {
        const existing = this.panels.get(guildId);
        if (existing) {
            existing.channelId  = channel.id;
            existing.textChannel = channel;
        } else {
            this.panels.set(guildId, {
                channelId:   channel.id,
                messageId:   null,
                textChannel: channel,
            });
        }
    }

    // ── Called whenever music state changes (play/pause/skip/vol…) ────────────
    public async update(guildId: string, queue: SimpleQueue, guildName: string): Promise<void> {
        try {
            const panel = this.panels.get(guildId);
            if (!panel) return; // No channel registered for this guild yet

            const embed = buildPlayerEmbed(queue, guildName);
            const rows  = buildControlRow(queue.paused, queue.repeatMode ?? 0);

            if (panel.messageId) {
                // Try to edit existing panel message
                try {
                    const msg = await panel.textChannel.messages.fetch(panel.messageId);
                    await msg.edit({ embeds: [embed], components: rows });
                    return;
                } catch {
                    // Message deleted or not found — fall through to send new
                    panel.messageId = null;
                }
            }

            // Send a fresh panel
            const sent = await panel.textChannel.send({ embeds: [embed], components: rows });
            panel.messageId = sent.id;
        } catch (err: any) {
            console.error(`[MusicPanel] Update failed for guild ${guildId}:`, err.message);
        }
    }

    // ── Called when playback stops / queue empty ──────────────────────────────
    public async destroy(guildId: string): Promise<void> {
        try {
            const panel = this.panels.get(guildId);
            if (!panel || !panel.messageId) return;

            try {
                const msg = await panel.textChannel.messages.fetch(panel.messageId);
                await msg.edit({ embeds: [buildStoppedEmbed()], components: [] });
            } catch {
                // Message gone — send a new stopped embed
                await panel.textChannel.send({ embeds: [buildStoppedEmbed()], components: [] });
            }

            // Reset message ID — next play will send a fresh panel
            panel.messageId = null;
        } catch (err: any) {
            console.error(`[MusicPanel] Destroy failed for guild ${guildId}:`, err.message);
        }
    }

    // ── Trigger an update using live queue state ──────────────────────────────
    public async refresh(guildId: string): Promise<void> {
        const queue = this.client.music.getQueue(guildId);
        if (!queue || !queue.songs?.length) {
            await this.destroy(guildId);
            return;
        }

        const guild = this.client.guilds.cache.get(guildId);
        await this.update(guildId, queue as SimpleQueue, guild?.name ?? "Server");
    }

    // ── Auto-detect and register the last text channel used in a guild ────────
    public async autoRegister(guildId: string, channelId: string): Promise<void> {
        try {
            const channel = await this.client.channels.fetch(channelId);
            if (channel && channel.isTextBased() && !channel.isDMBased()) {
                this.setChannel(guildId, channel as TextChannel);
            }
        } catch {
            // Channel fetch failed — no-op
        }
    }

    public hasPanel(guildId: string): boolean {
        return this.panels.has(guildId);
    }
}

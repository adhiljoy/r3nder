import {
    Events,
    Interaction,
    ChatInputCommandInteraction,
    ButtonInteraction,
    GuildMember,
    TextChannel,
} from "discord.js";
import { R3NDERClient } from "../client/R3nderClient";
import { MUSIC_BTN, buildPlayerEmbed, buildControlRow, buildStoppedEmbed, buildPlaylistEmbed } from "../utils/MusicUI";
import { LogType, LogPriority } from "../database/shared/Log";
import { User } from "../database/shared/User";
import { Guild } from "../database/shared/Guild";
import { AnalyticsService } from "../services/AnalyticsService";

// ─────────────────────────────────────────
// Button handler helper
// ─────────────────────────────────────────
async function handleMusicButton(client: R3NDERClient, interaction: ButtonInteraction): Promise<void> {
    const guildId = interaction.guildId;
    if (!guildId) return;

    // Rate limit: 2s per user per button
    const rlKey = `music_btn:${interaction.user.id}`;
    if (!client.ratelimit.check(rlKey, 1, 2000)) {
        await interaction.reply({ content: "⚠️ Slow down! 2s cooldown on buttons.", ephemeral: true });
        return;
    }

    // Enforce: user must be in a voice channel
    const member = interaction.member as GuildMember;
    if (!member.voice.channel) {
        await interaction.reply({ content: "❌ You must be in a voice channel to control music.", ephemeral: true });
        return;
    }

    const queue = client.music.getQueue(guildId);

    try {
        await interaction.deferUpdate();

        let queue_updated = queue;

        switch (interaction.customId) {
            case MUSIC_BTN.PAUSE:
                if (!queue) throw new Error("No music playing.");
                if (queue.paused) {
                    client.music.resume(guildId);
                } else {
                    client.music.pause(guildId);
                }
                queue_updated = client.music.getQueue(guildId) ?? null!;
                break;

            case MUSIC_BTN.SKIP:
                if (!queue) throw new Error("No music playing.");
                await client.music.skip(guildId);
                // Short delay for queue to update
                await new Promise(res => setTimeout(res, 800));
                queue_updated = client.music.getQueue(guildId) ?? null!;
                break;

            case MUSIC_BTN.STOP:
                await client.music.stop(guildId);
                // Edit to stopped UI
                await interaction.editReply({
                    embeds: [buildStoppedEmbed()],
                    components: [],
                });
                return;

            case MUSIC_BTN.LOOP:
                if (!queue) throw new Error("No music playing.");
                client.music.toggleLoop(guildId);
                queue_updated = client.music.getQueue(guildId) ?? null!;
                break;

            case MUSIC_BTN.SHUFFLE:
                if (!queue) throw new Error("No music playing.");
                client.music.shuffle(guildId);
                queue_updated = client.music.getQueue(guildId) ?? null!;
                break;

            case MUSIC_BTN.VOL_UP:
                if (!queue) throw new Error("No music playing.");
                client.music.setVolume(guildId, queue.volume + 10);
                queue_updated = client.music.getQueue(guildId) ?? null!;
                break;

            case MUSIC_BTN.VOL_DOWN:
                if (!queue) throw new Error("No music playing.");
                client.music.setVolume(guildId, queue.volume - 10);
                queue_updated = client.music.getQueue(guildId) ?? null!;
                break;

            case MUSIC_BTN.BACK:
                if (!queue) throw new Error("No music playing.");
                // Restart current track by stopping and re-queuing
                await client.music.skip(guildId);
                await new Promise(res => setTimeout(res, 800));
                queue_updated = client.music.getQueue(guildId) ?? null!;
                break;

            case MUSIC_BTN.AUTOPLAY:
                // AutoPlay: inform user it is not yet configured
                await interaction.followUp({
                    content: "🔮 **AutoPlay** — This feature is coming soon! Stay tuned.",
                    ephemeral: true,
                });
                return;

            case MUSIC_BTN.PLAYLIST:
                // Show the queue as an ephemeral embed
                if (!queue) throw new Error("No music playing.");
                {
                    const plEmbed = buildPlaylistEmbed(queue, interaction.guild?.name ?? "Server");
                    await interaction.followUp({ embeds: [plEmbed], ephemeral: true });
                }
                return;
        }

        // Update the persistent player embed
        if (queue_updated) {
            const embed = buildPlayerEmbed(queue_updated, interaction.guild?.name ?? "Server");
            const rows  = buildControlRow(queue_updated.paused, queue_updated.repeatMode ?? 0);
            await interaction.editReply({ embeds: [embed], components: rows });
        }

    } catch (error: any) {
        console.error("[MusicButton Error]", error);
        try {
            await interaction.followUp({ content: `❌ ${error.message}`, ephemeral: true });
        } catch { /* ignore if already replied */ }
    }
}

// ─────────────────────────────────────────
// Main event export
// ─────────────────────────────────────────
export default {
    name: Events.InteractionCreate,

    async execute(client: R3NDERClient, interaction: Interaction): Promise<void> {
        // Music button handler
        if (interaction.isButton()) {
            const isMusicBtn = Object.values(MUSIC_BTN).includes(interaction.customId as any);
            if (isMusicBtn) {
                await handleMusicButton(client, interaction as ButtonInteraction);
                return;
            }
        }

        // Slash command handler
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        // Rate Limit: 1.5s per user (0.8s for Premium)
        const userRec = await User.findOne({ userId: interaction.user.id });
        const isPremium = userRec?.premiumTier && userRec.premiumTier !== "free";
        
        if (!client.ratelimit.isAllowed(interaction.user.id, isPremium)) {
            await interaction.reply({ 
                content: "⚠️ **R3NDER Cooldown:** You're moving too fast! (1.5s limit)", 
                ephemeral: true 
            });
            return;
        }

        try {
            await command.execute(client, interaction as ChatInputCommandInteraction);
            // Track command usage
            if (interaction.guildId) {
                client.analytics.trackCommand(interaction.guildId, interaction.commandName, interaction.user.id);
            }
        } catch (error: unknown) {
            console.error("[Slash Command Error]", error);
            if ((interaction as ChatInputCommandInteraction).replied ||
                (interaction as ChatInputCommandInteraction).deferred) {
                await (interaction as ChatInputCommandInteraction).followUp({
                    content: "❌ An error occurred while executing this command.",
                    ephemeral: true,
                });
            } else {
                await (interaction as ChatInputCommandInteraction).reply({
                    content: "❌ An error occurred while executing this command.",
                    ephemeral: true,
                });
            }
        }
        // 6. Global Command Logging
        client.logs.log({
            type: LogType.COMMAND,
            priority: LogPriority.INFO,
            action: "COMMAND_EXECUTE",
            content: `Command executed: /${interaction.commandName} by ${interaction.user.tag}`,
            userId: interaction.user.id,
            guildId: interaction.guildId || undefined,
            metadata: { options: interaction.options.data }
        });

    },
};

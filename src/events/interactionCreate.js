"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const MusicUI_1 = require("../utils/MusicUI");
const Log_1 = require("../database/shared/Log");
const User_1 = require("../database/shared/User");
// ─────────────────────────────────────────
// Button handler helper
// ─────────────────────────────────────────
async function handleMusicButton(client, interaction) {
    const guildId = interaction.guildId;
    if (!guildId)
        return;
    // Rate limit: 2s per user per button
    const rlKey = `music_btn:${interaction.user.id}`;
    if (!client.ratelimit.check(rlKey, 1, 2000)) {
        await interaction.reply({ content: "⚠️ Slow down! 2s cooldown on buttons.", ephemeral: true });
        return;
    }
    // Enforce: user must be in a voice channel
    const member = interaction.member;
    if (!member.voice.channel) {
        await interaction.reply({ content: "❌ You must be in a voice channel to control music.", ephemeral: true });
        return;
    }
    const queue = client.music.getQueue(guildId);
    try {
        await interaction.deferUpdate();
        let queue_updated = queue;
        switch (interaction.customId) {
            case MusicUI_1.MUSIC_BTN.PAUSE:
                if (!queue)
                    throw new Error("No music playing.");
                if (queue.paused) {
                    client.music.resume(guildId);
                }
                else {
                    client.music.pause(guildId);
                }
                queue_updated = client.music.getQueue(guildId) ?? null;
                break;
            case MusicUI_1.MUSIC_BTN.SKIP:
                if (!queue)
                    throw new Error("No music playing.");
                await client.music.skip(guildId);
                // Short delay for queue to update
                await new Promise(res => setTimeout(res, 800));
                queue_updated = client.music.getQueue(guildId) ?? null;
                break;
            case MusicUI_1.MUSIC_BTN.STOP:
                await client.music.stop(guildId);
                // Edit to stopped UI
                await interaction.editReply({
                    embeds: [(0, MusicUI_1.buildStoppedEmbed)()],
                    components: [],
                });
                return;
            case MusicUI_1.MUSIC_BTN.LOOP:
                if (!queue)
                    throw new Error("No music playing.");
                client.music.toggleLoop(guildId);
                queue_updated = client.music.getQueue(guildId) ?? null;
                break;
            case MusicUI_1.MUSIC_BTN.SHUFFLE:
                if (!queue)
                    throw new Error("No music playing.");
                client.music.shuffle(guildId);
                queue_updated = client.music.getQueue(guildId) ?? null;
                break;
            case MusicUI_1.MUSIC_BTN.VOL_UP:
                if (!queue)
                    throw new Error("No music playing.");
                client.music.setVolume(guildId, queue.volume + 10);
                queue_updated = client.music.getQueue(guildId) ?? null;
                break;
            case MusicUI_1.MUSIC_BTN.VOL_DOWN:
                if (!queue)
                    throw new Error("No music playing.");
                client.music.setVolume(guildId, queue.volume - 10);
                queue_updated = client.music.getQueue(guildId) ?? null;
                break;
            case MusicUI_1.MUSIC_BTN.BACK:
                if (!queue)
                    throw new Error("No music playing.");
                // Restart current track by stopping and re-queuing
                await client.music.skip(guildId);
                await new Promise(res => setTimeout(res, 800));
                queue_updated = client.music.getQueue(guildId) ?? null;
                break;
            case MusicUI_1.MUSIC_BTN.AUTOPLAY:
                // AutoPlay: inform user it is not yet configured
                await interaction.followUp({
                    content: "🔮 **AutoPlay** — This feature is coming soon! Stay tuned.",
                    ephemeral: true,
                });
                return;
            case MusicUI_1.MUSIC_BTN.PLAYLIST:
                // Show the queue as an ephemeral embed
                if (!queue)
                    throw new Error("No music playing.");
                {
                    const plEmbed = (0, MusicUI_1.buildPlaylistEmbed)(queue, interaction.guild?.name ?? "Server");
                    await interaction.followUp({ embeds: [plEmbed], ephemeral: true });
                }
                return;
        }
        // Update the persistent player embed
        if (queue_updated) {
            const embed = (0, MusicUI_1.buildPlayerEmbed)(queue_updated, interaction.guild?.name ?? "Server");
            const rows = (0, MusicUI_1.buildControlRow)(queue_updated.paused, queue_updated.repeatMode ?? 0);
            await interaction.editReply({ embeds: [embed], components: rows });
        }
    }
    catch (error) {
        console.error("[MusicButton Error]", error);
        try {
            await interaction.followUp({ content: `❌ ${error.message}`, ephemeral: true });
        }
        catch { /* ignore if already replied */ }
    }
}
// ─────────────────────────────────────────
// Main event export
// ─────────────────────────────────────────
exports.default = {
    name: discord_js_1.Events.InteractionCreate,
    async execute(client, interaction) {
        // Music button handler
        if (interaction.isButton()) {
            const isMusicBtn = Object.values(MusicUI_1.MUSIC_BTN).includes(interaction.customId);
            if (isMusicBtn) {
                await handleMusicButton(client, interaction);
                return;
            }
        }
        // Slash command handler
        if (!interaction.isChatInputCommand())
            return;
        const command = client.commands.get(interaction.commandName);
        if (!command)
            return;
        // Rate Limit: 1.5s per user (0.8s for Premium)
        const userRec = await User_1.User.findOne({ userId: interaction.user.id });
        const isPremium = userRec?.premiumTier && userRec.premiumTier !== "free";
        if (!client.ratelimit.isAllowed(interaction.user.id, isPremium)) {
            await interaction.reply({
                content: "⚠️ **R3NDER Cooldown:** You're moving too fast! (1.5s limit)",
                ephemeral: true
            });
            return;
        }
        try {
            await command.execute(client, interaction);
            // Track command usage
            if (interaction.guildId) {
                client.analytics.trackCommand(interaction.guildId, interaction.commandName, interaction.user.id);
            }
        }
        catch (error) {
            console.error("[Slash Command Error]", error);
            if (interaction.replied ||
                interaction.deferred) {
                await interaction.followUp({
                    content: "❌ An error occurred while executing this command.",
                    ephemeral: true,
                });
            }
            else {
                await interaction.reply({
                    content: "❌ An error occurred while executing this command.",
                    ephemeral: true,
                });
            }
        }
        // 6. Global Command Logging
        client.logs.log({
            type: Log_1.LogType.COMMAND,
            priority: Log_1.LogPriority.INFO,
            action: "COMMAND_EXECUTE",
            content: `Command executed: /${interaction.commandName} by ${interaction.user.tag}`,
            userId: interaction.user.id,
            guildId: interaction.guildId || undefined,
            metadata: { options: interaction.options.data }
        });
    },
};

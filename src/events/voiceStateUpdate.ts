import { Events, VoiceState } from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import { LogType, LogPriority } from "@database/Log";

export default {
    name: Events.VoiceStateUpdate,
    async execute(client: R3NDERClient, oldState: VoiceState, newState: VoiceState): Promise<void> {
        const guild = newState.guild || oldState.guild;
        if (!guild) return;

        const member = newState.member || oldState.member;
        if (!member) return;

        // 1. Analytics Tracking (Concurrent Users)
        const concurrentCount = guild.members.cache.filter(m => !!m.voice.channelId).size;
        client.analytics.trackVoice(guild.id, concurrentCount);

        // 2. Logging
        const guildId = guild.id;
        const userId = member.id;

        // Voice Channel Switch
        if (oldState.channelId !== newState.channelId) {
            if (!oldState.channelId && newState.channelId) {
                // Joined
                client.logs.log({
                    type: LogType.VOICE,
                    priority: LogPriority.INFO,
                    action: "VOICE_JOIN",
                    content: `Member ${member.user.tag} joined voice channel **${newState.channel?.name}**`,
                    userId, guildId,
                    metadata: { channelId: newState.channelId, channelName: newState.channel?.name }
                });
            } else if (oldState.channelId && !newState.channelId) {
                // Left
                client.logs.log({
                    type: LogType.VOICE,
                    priority: LogPriority.INFO,
                    action: "VOICE_LEAVE",
                    content: `Member ${member.user.tag} left voice channel **${oldState.channel?.name}**`,
                    userId, guildId,
                    metadata: { channelId: oldState.channelId, channelName: oldState.channel?.name }
                });
            } else {
                // Moved
                client.logs.log({
                    type: LogType.VOICE,
                    priority: LogPriority.INFO,
                    action: "VOICE_MOVE",
                    content: `Member ${member.user.tag} moved from **${oldState.channel?.name}** ➔ **${newState.channel?.name}**`,
                    userId, guildId,
                    metadata: { from: oldState.channel?.name, to: newState.channel?.name }
                });
            }
        }

        // Server Mute Change
        if (oldState.serverMute !== newState.serverMute) {
            client.logs.log({
                type: LogType.MOD,
                priority: LogPriority.INFO,
                action: newState.serverMute ? "VOICE_MUTE_SERVER" : "VOICE_UNMUTE_SERVER",
                content: `Member ${member.user.tag} was ${newState.serverMute ? "server-muted" : "server-unmuted"}`,
                userId, guildId,
                targetId: userId
            });
        }

        // Server Deafen Change
        if (oldState.serverDeaf !== newState.serverDeaf) {
            client.logs.log({
                type: LogType.MOD,
                priority: LogPriority.INFO,
                action: newState.serverDeaf ? "VOICE_DEAFEN_SERVER" : "VOICE_UNDEAFEN_SERVER",
                content: `Member ${member.user.tag} was ${newState.serverDeaf ? "server-deafened" : "server-undeafened"}`,
                userId, guildId,
                targetId: userId
            });
        }
    },
};

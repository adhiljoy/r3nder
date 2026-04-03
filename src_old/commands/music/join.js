"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Log_1 = require("../../database/shared/Log");
const join = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("join")
        .setDescription("Make the bot join your current voice channel"),
    async execute(client, interaction) {
        const member = interaction.member;
        const channel = member.voice.channel;
        if (!channel) {
            await interaction.reply({ content: "❌ You must be in a voice channel for me to join!", ephemeral: true });
            return;
        }
        try {
            await client.music.join(channel);
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("📥 Joined Voice Channel")
                .setDescription(`Successfully linked to **${channel.name}**`)
                .setColor("#8B5CF6")
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
            // Log event
            await client.logs.log({
                type: Log_1.LogType.COMMAND,
                priority: Log_1.LogPriority.INFO,
                guildId: interaction.guildId,
                userId: interaction.user.id,
                action: "VC_JOIN",
                content: `Joined voice channel: ${channel.name}`,
                metadata: {
                    channelId: channel.id,
                    channelName: channel.name
                }
            });
        }
        catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ I failed to join the voice channel.", ephemeral: true });
        }
    },
};
exports.default = join;

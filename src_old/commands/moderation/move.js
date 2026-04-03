"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Log_1 = require("../../database/shared/Log");
const move = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("move")
        .setDescription("Move a user from one voice channel to another")
        .addUserOption(option => option.setName("target")
        .setDescription("The user to move")
        .setRequired(true))
        .addChannelOption(option => option.setName("channel")
        .setDescription("The voice channel to move the user to")
        .addChannelTypes(discord_js_1.ChannelType.GuildVoice, discord_js_1.ChannelType.GuildStageVoice)
        .setRequired(true))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.MoveMembers),
    async execute(client, interaction) {
        const targetUser = interaction.options.getUser("target", true);
        const channel = interaction.options.getChannel("channel", true);
        const member = interaction.guild?.members.cache.get(targetUser.id);
        if (!member) {
            await interaction.reply({ content: "❌ User is not in this server.", ephemeral: true });
            return;
        }
        if (!member.voice.channel) {
            await interaction.reply({ content: "❌ User is not in a voice channel.", ephemeral: true });
            return;
        }
        const oldChannel = member.voice.channel;
        try {
            await member.voice.setChannel(channel.id, `Moved by ${interaction.user.tag}`);
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("✈️ User Moved")
                .setColor("#3B82F6")
                .addFields({ name: "User", value: `${targetUser.tag}`, inline: true }, { name: "From", value: `${oldChannel.name}`, inline: true }, { name: "To", value: `${channel.name}`, inline: true })
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
            client.logs.log({
                type: Log_1.LogType.MOD,
                priority: Log_1.LogPriority.INFO,
                action: "VOICE_MOVE",
                content: `Member ${targetUser.tag} was moved from ${oldChannel.name} to ${channel.name} by ${interaction.user.tag}`,
                userId: interaction.user.id,
                guildId: interaction.guildId,
                targetId: targetUser.id,
                metadata: { from: oldChannel.name, to: channel.name }
            });
        }
        catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Failed to move the user.", ephemeral: true });
        }
    },
};
exports.default = move;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Log_1 = require("../../database/shared/Log");
const unmute = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("unmute")
        .setDescription("Unmute a user in a voice channel")
        .addUserOption(option => option.setName("target")
        .setDescription("The user to unmute")
        .setRequired(true))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.MuteMembers),
    async execute(client, interaction) {
        const targetUser = interaction.options.getUser("target", true);
        const member = interaction.guild?.members.cache.get(targetUser.id);
        if (!member) {
            await interaction.reply({ content: "❌ User is not in this server.", ephemeral: true });
            return;
        }
        if (!member.voice.channel) {
            await interaction.reply({ content: "❌ User is not in a voice channel.", ephemeral: true });
            return;
        }
        try {
            await member.voice.setMute(false, `Unmuted by ${interaction.user.tag}`);
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("🔊 Voice Unmuted")
                .setColor("#10B981")
                .addFields({ name: "User", value: `${targetUser.tag}`, inline: true }, { name: "Moderator", value: `${interaction.user.tag}`, inline: true })
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
            client.logs.log({
                type: Log_1.LogType.MOD,
                priority: Log_1.LogPriority.INFO,
                action: "VOICE_UNMUTE",
                content: `Member ${targetUser.tag} was voice unmuted by ${interaction.user.tag}`,
                userId: interaction.user.id,
                guildId: interaction.guildId,
                targetId: targetUser.id,
            });
        }
        catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Failed to voice unmute the user.", ephemeral: true });
        }
    },
};
exports.default = unmute;

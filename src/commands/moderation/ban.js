"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const ban = {
    data: new discord_js_1.SlashCommandBuilder().setName("ban").setDescription("Ban a user from the server")
        .addUserOption(o => o.setName("target").setDescription("User to ban").setRequired(true))
        .addStringOption(o => o.setName("reason").setDescription("Reason for ban"))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.BanMembers),
    async execute(client, interaction) {
        const target = interaction.options.getUser("target", true);
        const reason = interaction.options.getString("reason") ?? "No reason provided.";
        const member = interaction.guild?.members.cache.get(target.id);
        if (member && !member.bannable) {
            await interaction.reply({ content: "❌ I cannot ban this user.", ephemeral: true });
            return;
        }
        try {
            await interaction.guild?.members.ban(target.id, { reason });
            const embed = new discord_js_1.EmbedBuilder().setTitle("🔨 User Banned").setColor("#ED4245")
                .addFields({ name: "User", value: `${target.tag} (${target.id})`, inline: true }, { name: "Moderator", value: interaction.user.tag, inline: true }, { name: "Reason", value: reason }).setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: "❌ Error banning user.", ephemeral: true });
        }
    },
};
exports.default = ban;

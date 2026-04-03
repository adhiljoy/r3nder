"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const kick = {
    data: new discord_js_1.SlashCommandBuilder().setName("kick").setDescription("Kick a user from the server")
        .addUserOption(o => o.setName("target").setDescription("User to kick").setRequired(true))
        .addStringOption(o => o.setName("reason").setDescription("Reason for kick"))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.KickMembers),
    async execute(client, interaction) {
        const target = interaction.options.getUser("target", true);
        const reason = interaction.options.getString("reason") ?? "No reason provided.";
        const member = interaction.guild?.members.cache.get(target.id);
        if (!member) {
            await interaction.reply({ content: "❌ User not found.", ephemeral: true });
            return;
        }
        if (!member.kickable) {
            await interaction.reply({ content: "❌ I cannot kick this user.", ephemeral: true });
            return;
        }
        try {
            await member.kick(reason);
            const embed = new discord_js_1.EmbedBuilder().setTitle("👢 User Kicked").setColor("#FEE75C")
                .addFields({ name: "User", value: `${target.tag} (${target.id})`, inline: true }, { name: "Moderator", value: interaction.user.tag, inline: true }, { name: "Reason", value: reason }).setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: "❌ Error kicking user.", ephemeral: true });
        }
    },
};
exports.default = kick;

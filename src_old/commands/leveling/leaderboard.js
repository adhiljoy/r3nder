"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const User_1 = require("../../database/shared/User");
const leaderboard = {
    data: new discord_js_1.SlashCommandBuilder().setName("leaderboard").setDescription("Show the XP leaderboard"),
    async execute(client, interaction) {
        await interaction.deferReply();
        try {
            const topUsers = await User_1.User.find({ guildId: interaction.guildId }).sort({ xp: -1 }).limit(10);
            if (!topUsers.length) {
                await interaction.editReply({ content: "❌ No XP earned yet." });
                return;
            }
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(`🏆 ${interaction.guild?.name} Leaderboard`).setColor("#FEE75C")
                .setThumbnail(interaction.guild?.iconURL() || null)
                .setDescription(topUsers.map((u, i) => {
                const member = interaction.guild?.members.cache.get(u.userId);
                const name = member ? member.user.username : `Unknown#${u.userId.slice(0, 4)}`;
                return `**${i + 1}.** ${name} — Level **${u.level}** (${u.xp} XP)`;
            }).join("\n")).setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.editReply({ content: "❌ Error fetching leaderboard." });
        }
    },
};
exports.default = leaderboard;

import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import { Command } from "@appTypes/index";
import { User } from "@database/User";

const leaderboard: Command = {
    data: new SlashCommandBuilder().setName("leaderboard").setDescription("Show the XP leaderboard"),
    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply();
        try {
            const topUsers = await User.find({ guildId: interaction.guildId }).sort({ xp: -1 }).limit(10);
            if (!topUsers.length) {
                await interaction.editReply({ content: "❌ No XP earned yet." });
                return;
            }
            const embed = new EmbedBuilder()
                .setTitle(`🏆 ${interaction.guild?.name} Leaderboard`).setColor("#FEE75C")
                .setThumbnail(interaction.guild?.iconURL() || null)
                .setDescription(topUsers.map((u, i) => {
                    const member = interaction.guild?.members.cache.get(u.userId);
                    const name = member ? member.user.username : `Unknown#${u.userId.slice(0, 4)}`;
                    return `**${i + 1}.** ${name} — Level **${u.level}** (${u.xp} XP)`;
                }).join("\n")).setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } catch (error: unknown) {
            await interaction.editReply({ content: "❌ Error fetching leaderboard." });
        }
    },
};
export default leaderboard;

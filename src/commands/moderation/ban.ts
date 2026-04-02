import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { R3NDERClient } from "../../client/R3nderClient";
import { Command } from "../../types/index";

const ban: Command = {
    data: new SlashCommandBuilder().setName("ban").setDescription("Ban a user from the server")
        .addUserOption(o => o.setName("target").setDescription("User to ban").setRequired(true))
        .addStringOption(o => o.setName("reason").setDescription("Reason for ban"))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const target = interaction.options.getUser("target", true);
        const reason = interaction.options.getString("reason") ?? "No reason provided.";
        const member = interaction.guild?.members.cache.get(target.id);
        if (member && !member.bannable) {
            await interaction.reply({ content: "❌ I cannot ban this user.", ephemeral: true });
            return;
        }
        try {
            await interaction.guild?.members.ban(target.id, { reason });
            const embed = new EmbedBuilder().setTitle("🔨 User Banned").setColor("#ED4245")
                .addFields(
                    { name: "User", value: `${target.tag} (${target.id})`, inline: true },
                    { name: "Moderator", value: interaction.user.tag, inline: true },
                    { name: "Reason", value: reason }
                ).setTimestamp();
            await interaction.reply({ embeds: [embed] });
        } catch (error: unknown) {
            await interaction.reply({ content: "❌ Error banning user.", ephemeral: true });
        }
    },
};
export default ban;

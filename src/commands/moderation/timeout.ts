import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import { Command } from "@appTypes/index";

const timeout: Command = {
    data: new SlashCommandBuilder().setName("timeout").setDescription("Timeout a user (text mute)")
        .addUserOption(o => o.setName("target").setDescription("User to mute").setRequired(true))
        .addIntegerOption(o => o.setName("duration").setDescription("Duration in minutes").setRequired(true))
        .addStringOption(o => o.setName("reason").setDescription("Reason for mute"))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const target = interaction.options.getUser("target", true);
        const duration = interaction.options.getInteger("duration", true);
        const reason = interaction.options.getString("reason") ?? "No reason provided.";
        const member = interaction.guild?.members.cache.get(target.id);
        if (!member) { await interaction.reply({ content: "❌ User not found.", ephemeral: true }); return; }
        if (!member.moderatable) { await interaction.reply({ content: "❌ I cannot mute this user.", ephemeral: true }); return; }
        try {
            await member.timeout(duration * 60 * 1000, reason);
            const embed = new EmbedBuilder().setTitle("🔇 User Muted").setColor("#5865F2")
                .addFields(
                    { name: "User", value: `${target.tag} (${target.id})`, inline: true },
                    { name: "Duration", value: `${duration} minutes`, inline: true },
                    { name: "Moderator", value: interaction.user.tag, inline: true },
                    { name: "Reason", value: reason }
                ).setTimestamp();
            await interaction.reply({ embeds: [embed] });
        } catch (error: unknown) {
            await interaction.reply({ content: "❌ Error muting user.", ephemeral: true });
        }
    },
};
export default timeout;

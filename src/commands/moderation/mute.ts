import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    PermissionFlagsBits, 
    EmbedBuilder, 
    GuildMember 
} from "discord.js";
import { R3NDERClient } from "../../client/R3nderClient";
import { Command } from "../../types/index";
import { LogPriority, LogType } from "../../database/shared/Log";

const mute: Command = {
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Mute a user in a voice channel")
        .addUserOption(option => 
            option.setName("target")
                .setDescription("The user to mute")
                .setRequired(true))
        .addStringOption(option => 
            option.setName("reason")
                .setDescription("Reason for the mute"))
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),

    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const targetUser = interaction.options.getUser("target", true);
        const reason = interaction.options.getString("reason") || "No reason provided.";
        const member = interaction.guild?.members.cache.get(targetUser.id) as GuildMember;

        if (!member) {
            await interaction.reply({ content: "❌ User is not in this server.", ephemeral: true });
            return;
        }

        if (!member.voice.channel) {
            await interaction.reply({ content: "❌ User is not in a voice channel.", ephemeral: true });
            return;
        }

        try {
            await member.voice.setMute(true, reason);

            const embed = new EmbedBuilder()
                .setTitle("🔇 Voice Muted")
                .setColor("#EF4444")
                .addFields(
                    { name: "User", value: `${targetUser.tag}`, inline: true },
                    { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
                    { name: "Reason", value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            client.logs.log({
                type: LogType.MOD,
                priority: LogPriority.INFO,
                action: "VOICE_MUTE",
                content: `Member ${targetUser.tag} was voice muted by ${interaction.user.tag}`,
                userId: interaction.user.id,
                guildId: interaction.guildId!,
                targetId: targetUser.id,
                metadata: { reason }
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Failed to voice mute the user.", ephemeral: true });
        }
    },
};

export default mute;

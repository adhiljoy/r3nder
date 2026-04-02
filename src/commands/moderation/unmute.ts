import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    PermissionFlagsBits, 
    EmbedBuilder, 
    GuildMember 
} from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import { Command } from "@appTypes/index";
import { LogPriority, LogType } from "@database/Log";

const unmute: Command = {
    data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("Unmute a user in a voice channel")
        .addUserOption(option => 
            option.setName("target")
                .setDescription("The user to unmute")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),

    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const targetUser = interaction.options.getUser("target", true);
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
            await member.voice.setMute(false, `Unmuted by ${interaction.user.tag}`);

            const embed = new EmbedBuilder()
                .setTitle("🔊 Voice Unmuted")
                .setColor("#10B981")
                .addFields(
                    { name: "User", value: `${targetUser.tag}`, inline: true },
                    { name: "Moderator", value: `${interaction.user.tag}`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            client.logs.log({
                type: LogType.MOD,
                priority: LogPriority.INFO,
                action: "VOICE_UNMUTE",
                content: `Member ${targetUser.tag} was voice unmuted by ${interaction.user.tag}`,
                userId: interaction.user.id,
                guildId: interaction.guildId!,
                targetId: targetUser.id,
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Failed to voice unmute the user.", ephemeral: true });
        }
    },
};

export default unmute;

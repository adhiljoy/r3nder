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

const undeafen: Command = {
    data: new SlashCommandBuilder()
        .setName("undeafen")
        .setDescription("Remove server-deafen from a user in a voice channel")
        .addUserOption(option => 
            option.setName("target")
                .setDescription("The user to undeafen")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.DeafenMembers),

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
            await member.voice.setDeaf(false, `Undeafened by ${interaction.user.tag}`);

            const embed = new EmbedBuilder()
                .setTitle("🔊 User Undeafened")
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
                action: "VOICE_UNDEAFEN",
                content: `Member ${targetUser.tag} was voice undeafened by ${interaction.user.tag}`,
                userId: interaction.user.id,
                guildId: interaction.guildId!,
                targetId: targetUser.id,
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Failed to server-undeafen the user.", ephemeral: true });
        }
    },
};

export default undeafen;

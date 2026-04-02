import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    PermissionFlagsBits, 
    EmbedBuilder, 
    GuildMember,
    ChannelType
} from "discord.js";
import { R3NDERClient } from "../../client/R3nderClient";
import { Command } from "../../types/index";
import { LogPriority, LogType } from "../../database/shared/Log";

const move: Command = {
    data: new SlashCommandBuilder()
        .setName("move")
        .setDescription("Move a user from one voice channel to another")
        .addUserOption(option => 
            option.setName("target")
                .setDescription("The user to move")
                .setRequired(true))
        .addChannelOption(option => 
            option.setName("channel")
                .setDescription("The voice channel to move the user to")
                .addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),

    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const targetUser = interaction.options.getUser("target", true);
        const channel = interaction.options.getChannel("channel", true);
        const member = interaction.guild?.members.cache.get(targetUser.id) as GuildMember;

        if (!member) {
            await interaction.reply({ content: "❌ User is not in this server.", ephemeral: true });
            return;
        }

        if (!member.voice.channel) {
            await interaction.reply({ content: "❌ User is not in a voice channel.", ephemeral: true });
            return;
        }

        const oldChannel = member.voice.channel;

        try {
            await member.voice.setChannel(channel.id as string, `Moved by ${interaction.user.tag}`);

            const embed = new EmbedBuilder()
                .setTitle("✈️ User Moved")
                .setColor("#3B82F6")
                .addFields(
                    { name: "User", value: `${targetUser.tag}`, inline: true },
                    { name: "From", value: `${oldChannel.name}`, inline: true },
                    { name: "To", value: `${(channel as any).name}`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            client.logs.log({
                type: LogType.MOD,
                priority: LogPriority.INFO,
                action: "VOICE_MOVE",
                content: `Member ${targetUser.tag} was moved from ${oldChannel.name} to ${(channel as any).name} by ${interaction.user.tag}`,
                userId: interaction.user.id,
                guildId: interaction.guildId!,
                targetId: targetUser.id,
                metadata: { from: oldChannel.name, to: (channel as any).name }
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Failed to move the user.", ephemeral: true });
        }
    },
};

export default move;

import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import { Command } from "@appTypes/index";
import { LogType, LogPriority } from "@database/Log";

const join: Command = {
    data: new SlashCommandBuilder()
        .setName("join")
        .setDescription("Make the bot join your current voice channel"),

    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const member = interaction.member as GuildMember;
        const channel = member.voice.channel;

        if (!channel) {
            await interaction.reply({ content: "❌ You must be in a voice channel for me to join!", ephemeral: true });
            return;
        }

        try {
            await client.music.join(channel);

            const embed = new EmbedBuilder()
                .setTitle("📥 Joined Voice Channel")
                .setDescription(`Successfully linked to **${channel.name}**`)
                .setColor("#8B5CF6")
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Log event
            await client.logs.log({
                type: LogType.COMMAND,
                priority: LogPriority.INFO,
                guildId: interaction.guildId!,
                userId: interaction.user.id,
                action: "VC_JOIN",
                content: `Joined voice channel: ${channel.name}`,
                metadata: {
                    channelId: channel.id,
                    channelName: channel.name
                }
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ I failed to join the voice channel.", ephemeral: true });
        }
    },
};

export default join;

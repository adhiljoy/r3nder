import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    PermissionFlagsBits, 
    ChannelType,
    EmbedBuilder 
} from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import { Command } from "../../types";
import { Guild } from "@database/Guild";
import { LogPriority, LogType } from "@database/Log";

const setLogChannel: Command = {
    data: new SlashCommandBuilder()
        .setName("setlogchannel")
        .setDescription("Set the channel where server logs will be sent")
        .addChannelOption(option => 
            option.setName("channel")
                .setDescription("The channel to send logs to")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const channel = interaction.options.getChannel("channel", true);
        const guildId = interaction.guildId!;

        await Guild.findOneAndUpdate(
            { guildId },
            { logChannelId: channel.id },
            { upsert: true }
        );

        const embed = new EmbedBuilder()
            .setTitle("✅ Logging Channel Updated")
            .setDescription(`All server logs will now be sent to ${channel}.`)
            .setColor("#10B981")
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Log the action locally
        client.logs.log({
            type: LogType.SYSTEM,
            priority: LogPriority.INFO,
            action: "SET_LOG_CHANNEL",
            content: `Logging channel set to #${(channel as any).name} (${channel.id})`,
            userId: interaction.user.id,
            guildId: guildId,
            metadata: { channelId: channel.id }
        });
    },
};

export default setLogChannel;

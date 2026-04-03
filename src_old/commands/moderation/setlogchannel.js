"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Guild_1 = require("../../database/shared/Guild");
const Log_1 = require("../../database/shared/Log");
const setLogChannel = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("setlogchannel")
        .setDescription("Set the channel where server logs will be sent")
        .addChannelOption(option => option.setName("channel")
        .setDescription("The channel to send logs to")
        .addChannelTypes(discord_js_1.ChannelType.GuildText)
        .setRequired(true))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator),
    async execute(client, interaction) {
        const channel = interaction.options.getChannel("channel", true);
        const guildId = interaction.guildId;
        await Guild_1.Guild.findOneAndUpdate({ guildId }, { logChannelId: channel.id }, { upsert: true });
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle("✅ Logging Channel Updated")
            .setDescription(`All server logs will now be sent to ${channel}.`)
            .setColor("#10B981")
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
        // Log the action locally
        client.logs.log({
            type: Log_1.LogType.SYSTEM,
            priority: Log_1.LogPriority.INFO,
            action: "SET_LOG_CHANNEL",
            content: `Logging channel set to #${channel.name} (${channel.id})`,
            userId: interaction.user.id,
            guildId: guildId,
            metadata: { channelId: channel.id }
        });
    },
};
exports.default = setLogChannel;

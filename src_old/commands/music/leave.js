"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Log_1 = require("../../database/shared/Log");
const leave = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("leave")
        .setDescription("Make the bot leave the voice channel"),
    async execute(client, interaction) {
        const guildId = interaction.guildId;
        try {
            client.music.leave(guildId);
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("📤 Disconnected")
                .setDescription("Successfully disconnected from the voice channel.")
                .setColor("#EF4444")
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
            // Log event
            await client.logs.log({
                type: Log_1.LogType.COMMAND,
                priority: Log_1.LogPriority.INFO,
                guildId: guildId,
                userId: interaction.user.id,
                action: "VC_LEAVE",
                content: "Disconnected from voice channel.",
                metadata: {
                    manual: true
                }
            });
        }
        catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ An error occurred while trying to leave.", ephemeral: true });
        }
    },
};
exports.default = leave;

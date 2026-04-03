"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Guild_1 = require("../../database/shared/Guild");
const r3nder = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("r3nder")
        .setDescription("Chat with R3NDER Universal AI")
        .addStringOption(option => option.setName("prompt")
        .setDescription("What would you like to ask R3NDER?")
        .setRequired(true)),
    async execute(client, interaction) {
        const guildId = interaction.guildId;
        const userId = interaction.user.id;
        const prompt = interaction.options.getString("prompt", true);
        // 1. Fetch Guild Configuration
        const guildData = await Guild_1.Guild.findOne({ guildId });
        if (!guildData?.aiAutopilot?.enabled) {
            await interaction.reply({
                content: "❌ AI services are currently disabled for this server by the administration.",
                ephemeral: true
            });
            return;
        }
        // 2. Authorization Check (Admin OR Whitelisted)
        const adminIds = (process.env.ADMIN_IDS || "").split(",");
        const isWhitelisted = guildData.aiAutopilot.allowedUsers?.includes(userId);
        const isAdmin = adminIds.includes(userId) || interaction.memberPermissions?.has(discord_js_1.PermissionsBitField.Flags.Administrator);
        if (!isAdmin && !isWhitelisted) {
            await interaction.reply({
                content: "❌ Access Denied. Your account is not authorized to interact with the R3NDER AI Core.",
                ephemeral: true
            });
            return;
        }
        // 3. Defer Response
        await interaction.deferReply();
        try {
            // 4. Generate AI Response
            const response = await client.ai.chat(userId, guildId, interaction.channelId, prompt);
            // 5. Build Universal UI
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("🤖 R3NDER Universal Intelligence")
                .setDescription(response)
                .setColor("#5865F2")
                .setFooter({ text: `R3NDER v1.0 • Global AI Assistant` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            console.error("[Slash-R3NDER Error]", error);
            await interaction.editReply({
                content: "❌ Failure in cognitive processors. Please retry your request shortly."
            });
        }
    },
};
exports.default = r3nder;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const axios_1 = __importDefault(require("axios"));
const Log_1 = require("../../database/shared/Log");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("identify")
        .setDescription("Identify music from an uploaded audio file.")
        .addAttachmentOption(option => option.setName("audio")
        .setDescription("The audio file to identify (mp3, wav, ogg)")
        .setRequired(true)),
    async execute(client, interaction) {
        const attachment = interaction.options.getAttachment("audio", true);
        const allowedExtensions = ["mp3", "wav", "ogg", "m4a"];
        const extension = attachment.name?.split(".").pop()?.toLowerCase();
        if (!extension || !allowedExtensions.includes(extension)) {
            await interaction.reply({
                content: "❌ Invalid file type. Please upload a supported audio format (mp3, wav, ogg).",
                ephemeral: true
            });
            return;
        }
        if (attachment.size > 10 * 1024 * 1024) {
            await interaction.reply({
                content: "❌ File too large. Maximum size is 10MB.",
                ephemeral: true
            });
            return;
        }
        await interaction.deferReply();
        try {
            const response = await axios_1.default.get(attachment.url, { responseType: "arraybuffer" });
            const buffer = Buffer.from(response.data);
            const result = await client.musicRecognition.identify(buffer);
            if (!result) {
                await interaction.editReply({ content: "🔍 Could not पहचान the song. (No match found or API error)" });
                return;
            }
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("🎵 Song Identified")
                .addFields({ name: "🎵 Song", value: result.title, inline: true }, { name: "🎤 Artist", value: result.artist, inline: true }, { name: "💿 Album", value: result.album, inline: true })
                .setColor("#8B5CF6")
                .setTimestamp()
                .setFooter({ text: "Powered by R3NDER Audio Engine", iconURL: client.user?.displayAvatarURL() });
            await interaction.editReply({ embeds: [embed] });
            // Log event
            await client.logs.log({
                type: Log_1.LogType.COMMAND,
                priority: Log_1.LogPriority.INFO,
                guildId: interaction.guildId,
                userId: interaction.user.id,
                action: "SONG_IDENTIFIED",
                content: `Identified track: ${result.title} by ${result.artist}`,
                metadata: {
                    title: result.title,
                    artist: result.artist
                }
            });
        }
        catch (error) {
            console.error("[Identify Command Error]", error);
            await interaction.editReply({ content: "❌ An error occurred during identification." });
        }
    }
};

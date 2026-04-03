"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const ocr = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("ocr").setDescription("Extract text from an image using AI")
        .addAttachmentOption(option => option.setName("image").setDescription("Upload the image to extract text from").setRequired(true)),
    async execute(client, interaction) {
        const attachment = interaction.options.getAttachment("image", true);
        const rateLimitKey = `vision:${interaction.user.id}`;
        if (!client.ratelimit.check(rateLimitKey, 1, 30000)) {
            await interaction.reply({ content: "⚠️ Vision commands have a 30s cooldown.", ephemeral: true });
            return;
        }
        try {
            client.vision.validateImage(attachment.size, attachment.contentType || "");
            await interaction.deferReply();
            const extractedText = await client.vision.processImage(attachment.url, "Extract all text from this image. Use Markdown tables for structured data. Return 'No text found.' if there is no text.");
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("📝 Extracted Text (OCR)").setDescription(extractedText.slice(0, 4000))
                .setThumbnail(attachment.url).setColor("#57F287")
                .setFooter({ text: "Powered by R3NDER Vision" }).setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            if (interaction.deferred) {
                await interaction.editReply({ content: `❌ ${error.message}` });
            }
            else {
                await interaction.reply({ content: `❌ ${error.message}`, ephemeral: true });
            }
        }
    },
};
exports.default = ocr;

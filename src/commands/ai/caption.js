"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const caption = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("caption").setDescription("Generate styled captions for images")
        .addAttachmentOption(option => option.setName("image").setDescription("Upload the image to caption").setRequired(true))
        .addStringOption(option => option.setName("style").setDescription("Caption style").setRequired(true)
        .addChoices({ name: "Funny", value: "funny" }, { name: "Dark", value: "dark" }, { name: "Cool", value: "cool" }, { name: "Poetic", value: "poetic" }, { name: "Savage", value: "savage" }, { name: "Professional", value: "professional" }, { name: "Minimal", value: "minimal" })),
    async execute(client, interaction) {
        const attachment = interaction.options.getAttachment("image", true);
        const style = interaction.options.getString("style", true);
        const rateLimitKey = `vision:${interaction.user.id}`;
        if (!client.ratelimit.check(rateLimitKey, 1, 30000)) {
            await interaction.reply({ content: "⚠️ Vision commands have a 30s cooldown.", ephemeral: true });
            return;
        }
        try {
            client.vision.validateImage(attachment.size, attachment.contentType || "");
            await interaction.deferReply();
            const captions = await client.vision.processImage(attachment.url, `Generate 3 creative captions in a ${style} style. Keep them short. Format as bullet points.`);
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(`✨ Creative Captions (${style})`).setDescription(captions)
                .setThumbnail(attachment.url).setColor("#EB459E")
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
exports.default = caption;

import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { R3NDERClient } from "../../client/R3nderClient";
import { Command } from "../../types/index";

const analyze: Command = {
    data: new SlashCommandBuilder()
        .setName("analyze").setDescription("AI-powered image analysis")
        .addAttachmentOption(option =>
            option.setName("image").setDescription("Upload the image to analyze").setRequired(true)),
    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const attachment = interaction.options.getAttachment("image", true);
        const rateLimitKey = `vision:${interaction.user.id}`;
        if (!client.ratelimit.check(rateLimitKey, 1, 30000)) {
            await interaction.reply({ content: "⚠️ Vision commands have a 30s cooldown.", ephemeral: true });
            return;
        }
        try {
            client.vision.validateImage(attachment.size, attachment.contentType || "");
            await interaction.deferReply();
            const description = await client.vision.processImage(attachment.url,
                "Describe this image in detail. Focus on main subjects, colors, and layout.");
            const embed = new EmbedBuilder()
                .setTitle("👁️ Image Analysis").setDescription(description)
                .setThumbnail(attachment.url).setColor("#5865F2")
                .setFooter({ text: "Powered by R3NDER Vision" }).setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } catch (error: any) {
            if (interaction.deferred) {
                await interaction.editReply({ content: `❌ ${error.message}` });
            } else {
                await interaction.reply({ content: `❌ ${error.message}`, ephemeral: true });
            }
        }
    },
};
export default analyze;

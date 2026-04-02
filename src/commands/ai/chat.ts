import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import { Command } from "@appTypes/index";

const chat: Command = {
    data: new SlashCommandBuilder()
        .setName("chat")
        .setDescription("Chat with R3NDER AI Assistant")
        .addStringOption(option =>
            option.setName("prompt").setDescription("What do you want to say?").setRequired(true)),
    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const prompt = interaction.options.getString("prompt", true);
        await interaction.deferReply();
        try {
            const response = await client.ai.chat(interaction.user.id, interaction.guildId!, interaction.channelId, prompt);
            const embed = new EmbedBuilder()
                .setTitle("🤖 R3NDER AI Assistant").setDescription(response).setColor("#5865F2")
                .setFooter({ text: `Requested by ${interaction.user.username}` }).setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } catch (error: any) {
            console.error("[Chat Command Error]", error);
            await interaction.editReply({ content: "❌ Sorry, I'm having trouble thinking right now." });
        }
    },
};
export default chat;

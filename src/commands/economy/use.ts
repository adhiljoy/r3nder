import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import { Command } from "@appTypes/index";

const EFFECT_DESCRIPTIONS: Record<string, string> = {
    xp_boost: "XP Boost activated! You'll earn bonus XP for the duration.",
    badge: "Badge applied to your profile!",
    ai_perk: "AI perk activated! Reduced cooldowns on AI commands.",
    role: "This item's effect is applied on purchase.",
};

const use: Command = {
    data: new SlashCommandBuilder()
        .setName("use")
        .setDescription("Use a consumable item from your inventory")
        .addStringOption(o =>
            o.setName("item").setDescription("Name of the item to use").setRequired(true)),
    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const itemName = interaction.options.getString("item", true);

        try {
            const usedItem = await client.shop.useItem(
                interaction.user.id,
                interaction.guildId!,
                itemName,
                interaction.guild!
            );

            const effectText = EFFECT_DESCRIPTIONS[usedItem.type] ?? "Item used successfully.";
            const expiryText = usedItem.expiresAt
                ? `\n⏳ **Expires:** <t:${Math.floor(usedItem.expiresAt.getTime() / 1000)}:R>`
                : "";

            const embed = new EmbedBuilder()
                .setTitle("✨ Item Used!")
                .setColor("#EB459E")
                .addFields(
                    { name: "Item", value: `**${usedItem.name}**`, inline: true },
                    { name: "Type", value: `\`${usedItem.type}\``, inline: true },
                    { name: "Remaining", value: `x${usedItem.quantity}`, inline: true },
                    { name: "Effect", value: effectText + expiryText }
                )
                .setFooter({ text: "R3NDER Economy" })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error: any) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Cannot Use Item")
                .setColor("#ED4245")
                .setDescription(error.message)
                .setFooter({ text: "R3NDER Economy" });
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};

export default use;

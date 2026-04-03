"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const EFFECT_DESCRIPTIONS = {
    xp_boost: "XP Boost activated! You'll earn bonus XP for the duration.",
    badge: "Badge applied to your profile!",
    ai_perk: "AI perk activated! Reduced cooldowns on AI commands.",
    role: "This item's effect is applied on purchase.",
};
const use = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("use")
        .setDescription("Use a consumable item from your inventory")
        .addStringOption(o => o.setName("item").setDescription("Name of the item to use").setRequired(true)),
    async execute(client, interaction) {
        const itemName = interaction.options.getString("item", true);
        try {
            const usedItem = await client.shop.useItem(interaction.user.id, interaction.guildId, itemName, interaction.guild);
            const effectText = EFFECT_DESCRIPTIONS[usedItem.type] ?? "Item used successfully.";
            const expiryText = usedItem.expiresAt
                ? `\n⏳ **Expires:** <t:${Math.floor(usedItem.expiresAt.getTime() / 1000)}:R>`
                : "";
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("✨ Item Used!")
                .setColor("#EB459E")
                .addFields({ name: "Item", value: `**${usedItem.name}**`, inline: true }, { name: "Type", value: `\`${usedItem.type}\``, inline: true }, { name: "Remaining", value: `x${usedItem.quantity}`, inline: true }, { name: "Effect", value: effectText + expiryText })
                .setFooter({ text: "R3NDER Economy" })
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("❌ Cannot Use Item")
                .setColor("#ED4245")
                .setDescription(error.message)
                .setFooter({ text: "R3NDER Economy" });
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
exports.default = use;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const buy = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("buy")
        .setDescription("Purchase an item from the shop")
        .addStringOption(o => o.setName("item_id").setDescription("The Item ID from /shop").setRequired(true)),
    async execute(client, interaction) {
        const itemId = interaction.options.getString("item_id", true).trim();
        // Anti-spam
        const rateLimitKey = `buy:${interaction.user.id}`;
        if (!client.ratelimit.check(rateLimitKey, 3, 15000)) {
            await interaction.reply({ content: "⚠️ You're buying too fast! Slow down.", ephemeral: true });
            return;
        }
        await interaction.deferReply();
        try {
            const result = await client.shop.purchase(interaction.user.id, interaction.guildId, itemId, interaction.guild);
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("✅ Purchase Successful!")
                .setColor("#57F287")
                .addFields({ name: "Item", value: `**${result.item.name}**`, inline: true }, { name: "Price Paid", value: `🪙 ${result.item.price.toLocaleString()} coins`, inline: true }, { name: "Remaining Balance", value: `🪙 ${result.newBalance.toLocaleString()} coins`, inline: true }, { name: "Type", value: result.item.type, inline: true }, { name: "Effect", value: result.item.description })
                .setFooter({ text: "Use /inventory to view your items • R3NDER Economy" })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("❌ Purchase Failed")
                .setColor("#ED4245")
                .setDescription(error.message)
                .setFooter({ text: "R3NDER Economy" });
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
exports.default = buy;

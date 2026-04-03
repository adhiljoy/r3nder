"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const TYPE_ICONS = {
    role: "👑",
    xp_boost: "⚡",
    badge: "🎖️",
    ai_perk: "🤖",
};
const inventory = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("inventory")
        .setDescription("View your item inventory"),
    async execute(client, interaction) {
        await interaction.deferReply();
        try {
            const items = await client.shop.getInventory(interaction.user.id, interaction.guildId);
            if (!items.length) {
                const empty = new discord_js_1.EmbedBuilder()
                    .setTitle("🎒 Your Inventory")
                    .setColor("#5865F2")
                    .setDescription("Your inventory is empty!\nUse `/shop` to browse items and `/buy` to purchase them.")
                    .setFooter({ text: "R3NDER Economy" });
                await interaction.editReply({ embeds: [empty] });
                return;
            }
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(`🎒 ${interaction.user.username}'s Inventory`)
                .setColor("#5865F2")
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(items.map(item => {
                const icon = TYPE_ICONS[item.type] ?? "📦";
                const statusLine = item.expiresAt
                    ? `\n> ⏳ Expires: <t:${Math.floor(item.expiresAt.getTime() / 1000)}:R>`
                    : "";
                const consumedLine = item.consumed ? " *(used)*" : "";
                return `${icon} **${item.name}** x${item.quantity}${consumedLine}\n> Type: \`${item.type}\`${statusLine}`;
            }).join("\n\n"))
                .addFields({ name: "How to Use", value: "Use `/use <item-name>` to activate consumable items." })
                .setFooter({ text: `${items.length} item type(s) • R3NDER Economy` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.editReply({ content: "❌ Error fetching inventory." });
        }
    },
};
exports.default = inventory;

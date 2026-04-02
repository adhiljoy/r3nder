import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { R3NDERClient } from "../../client/R3nderClient";
import { Command } from "../../types/index";

const TYPE_ICONS: Record<string, string> = {
    role: "👑",
    xp_boost: "⚡",
    badge: "🎖️",
    ai_perk: "🤖",
};

const inventory: Command = {
    data: new SlashCommandBuilder()
        .setName("inventory")
        .setDescription("View your item inventory"),
    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply();

        try {
            const items = await client.shop.getInventory(interaction.user.id, interaction.guildId!);

            if (!items.length) {
                const empty = new EmbedBuilder()
                    .setTitle("🎒 Your Inventory")
                    .setColor("#5865F2")
                    .setDescription("Your inventory is empty!\nUse `/shop` to browse items and `/buy` to purchase them.")
                    .setFooter({ text: "R3NDER Economy" });
                await interaction.editReply({ embeds: [empty] });
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(`🎒 ${interaction.user.username}'s Inventory`)
                .setColor("#5865F2")
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(
                    items.map(item => {
                        const icon = TYPE_ICONS[item.type] ?? "📦";
                        const statusLine = item.expiresAt
                            ? `\n> ⏳ Expires: <t:${Math.floor(item.expiresAt.getTime() / 1000)}:R>`
                            : "";
                        const consumedLine = item.consumed ? " *(used)*" : "";
                        return `${icon} **${item.name}** x${item.quantity}${consumedLine}\n> Type: \`${item.type}\`${statusLine}`;
                    }).join("\n\n")
                )
                .addFields({ name: "How to Use", value: "Use `/use <item-name>` to activate consumable items." })
                .setFooter({ text: `${items.length} item type(s) • R3NDER Economy` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error: unknown) {
            await interaction.editReply({ content: "❌ Error fetching inventory." });
        }
    },
};

export default inventory;

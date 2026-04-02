import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import { Command } from "@appTypes/index";

const ITEMS_PER_PAGE = 5;

const TYPE_ICONS: Record<string, string> = {
    role: "👑",
    xp_boost: "⚡",
    badge: "🎖️",
    ai_perk: "🤖",
};

const shop: Command = {
    data: new SlashCommandBuilder()
        .setName("shop")
        .setDescription("Browse the server shop")
        .addIntegerOption(o =>
            o.setName("page").setDescription("Page number").setMinValue(1)),
    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply();

        try {
            const items = await client.shop.getItems(interaction.guildId!);
            if (!items.length) {
                await interaction.editReply({ content: "🏪 The shop is currently empty. Ask an admin to add items!" });
                return;
            }

            const page = (interaction.options.getInteger("page") ?? 1) - 1;
            const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
            const pageItems = items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

            const embed = new EmbedBuilder()
                .setTitle(`🏪 ${interaction.guild?.name} Shop`)
                .setColor("#F1C40F")
                .setThumbnail(interaction.guild?.iconURL() ?? null)
                .setDescription(
                    pageItems.map(item => {
                        const icon = TYPE_ICONS[item.type] ?? "📦";
                        const stock = item.stock === -1 ? "∞" : `${item.stock}`;
                        const consumable = item.consumable ? " *(consumable)*" : "";
                        return `${icon} **${item.name}** — 🪙 ${item.price.toLocaleString()} coins\n> ${item.description}${consumable}\n> Stock: **${stock}** | ID: \`${item._id}\``;
                    }).join("\n\n")
                )
                .addFields({ name: "How to Buy", value: "Use `/buy <item-id>` to purchase an item." })
                .setFooter({ text: `Page ${page + 1} / ${totalPages} • R3NDER Economy` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error: unknown) {
            await interaction.editReply({ content: "❌ Error loading shop." });
        }
    },
};

export default shop;

import { Guild } from "discord.js";
import { ShopItem, IShopItem } from "../database/shared/ShopItem";
import { Inventory, IInventoryItem } from "../database/shared/Inventory";
import { EconomyService } from "./EconomyService";

export interface PurchaseResult {
    item: IShopItem;
    newBalance: number;
}

export class ShopService {
    private economy: EconomyService;

    constructor() {
        this.economy = new EconomyService();
    }

    /** Get all shop items for a guild */
    public async getItems(guildId: string): Promise<IShopItem[]> {
        return ShopItem.find({ guildId });
    }

    /** Get a single item by ID */
    public async getItem(itemId: string): Promise<IShopItem | null> {
        return ShopItem.findById(itemId);
    }

    /** Purchase an item — handles validation, deduction, and inventory update */
    public async purchase(
        userId: string,
        guildId: string,
        itemId: string,
        guild: Guild
    ): Promise<PurchaseResult> {
        const item = await ShopItem.findById(itemId);
        if (!item) throw new Error("Item not found in shop.");
        if (item.guildId !== guildId) throw new Error("Item not available in this server.");
        if (item.stock === 0) throw new Error("This item is out of stock.");

        // Deduct coins
        const profile = await this.economy.deductCoins(userId, guildId, item.price);

        // Reduce stock if limited
        if (item.stock > 0) {
            item.stock -= 1;
            await item.save();
        }

        // Add to inventory
        let inventory = await Inventory.findOne({ userId, guildId });
        if (!inventory) {
            inventory = await Inventory.create({ userId, guildId, items: [] });
        }

        const existingItem = inventory.items.find(i => i.itemId === itemId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            const newItem: IInventoryItem = {
                itemId,
                name: item.name,
                type: item.type,
                quantity: 1,
                acquiredAt: new Date(),
                consumed: false,
                badgeEmoji: item.badgeEmoji,
                boostMultiplier: item.boostMultiplier,
                boostDurationMs: item.boostDurationMs,
                aiCooldownReductionMs: item.aiCooldownReductionMs,
            };
            inventory.items.push(newItem);
        }
        await inventory.save();

        // Apply immediate effects (e.g., roles)
        if (item.type === "role" && item.roleId) {
            const member = await guild.members.fetch(userId).catch(() => null);
            if (member) {
                await member.roles.add(item.roleId).catch((err: Error) =>
                    console.warn("[ShopService] Failed to add role:", err.message)
                );
            }
        }

        return { item, newBalance: profile.coins };
    }

    /** Use a consumable item from inventory */
    public async useItem(
        userId: string,
        guildId: string,
        itemName: string,
        guild: Guild
    ): Promise<IInventoryItem> {
        const inventory = await Inventory.findOne({ userId, guildId });
        if (!inventory) throw new Error("You have no items in your inventory.");

        const item = inventory.items.find(
            i => i.name.toLowerCase() === itemName.toLowerCase() && i.quantity > 0 && !i.consumed
        );
        if (!item) throw new Error(`You don't have **${itemName}** in your inventory.`);

        // Apply effects
        if (item.type === "xp_boost" && item.boostDurationMs) {
            item.expiresAt = new Date(Date.now() + item.boostDurationMs);
        }

        if (item.type === "ai_perk") {
            // Mark as consumed — effect tracked via expiry
            item.expiresAt = new Date(Date.now() + (item.aiCooldownReductionMs ?? 3600000));
        }

        if (item.type === "role") {
            throw new Error("Role items are applied automatically on purchase.");
        }

        item.quantity -= 1;
        if (item.quantity <= 0) item.consumed = true;

        await inventory.save();
        return item;
    }

    /** Add a shop item (admin use) */
    public async addItem(guildId: string, itemData: Partial<IShopItem>): Promise<IShopItem> {
        const item = await ShopItem.create({ ...itemData, guildId });
        return item;
    }

    /** Remove a shop item (admin use) */
    public async removeItem(itemId: string): Promise<void> {
        await ShopItem.findByIdAndDelete(itemId);
    }

    /** Get user inventory */
    public async getInventory(userId: string, guildId: string): Promise<IInventoryItem[]> {
        const inventory = await Inventory.findOne({ userId, guildId });
        if (!inventory) return [];
        return inventory.items.filter(i => i.quantity > 0);
    }
}

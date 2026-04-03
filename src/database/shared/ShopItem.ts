import mongoose, { Schema, Document } from "mongoose";

export type ItemType = "role" | "xp_boost" | "badge" | "ai_perk";

export interface IShopItem extends Document {
    guildId: string;
    name: string;
    description: string;
    price: number;
    type: ItemType;
    roleId?: string;       // For "role" items
    boostMultiplier?: number; // For "xp_boost" items
    boostDurationMs?: number; // For "xp_boost" items
    aiCooldownReductionMs?: number; // For "ai_perk" items
    badgeEmoji?: string;   // For "badge" items
    consumable: boolean;
    stock: number;          // -1 = unlimited
}

const ShopItemSchema: Schema = new Schema({
    guildId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["role", "xp_boost", "badge", "ai_perk"], required: true },
    roleId: { type: String },
    boostMultiplier: { type: Number },
    boostDurationMs: { type: Number },
    aiCooldownReductionMs: { type: Number },
    badgeEmoji: { type: String },
    consumable: { type: Boolean, default: false },
    stock: { type: Number, default: -1 },
});

export const ShopItem = mongoose.model<IShopItem>("ShopItem", ShopItemSchema);

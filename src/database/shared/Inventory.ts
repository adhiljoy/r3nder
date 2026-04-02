import mongoose, { Schema, Document } from "mongoose";
import { ItemType } from "./ShopItem";

export interface IInventoryItem {
    itemId: string;
    name: string;
    type: ItemType;
    quantity: number;
    acquiredAt: Date;
    expiresAt?: Date; // For temporary boosts
    consumed: boolean;
    badgeEmoji?: string;
    boostMultiplier?: number;
    boostDurationMs?: number;
    aiCooldownReductionMs?: number;
}

export interface IInventory extends Document {
    userId: string;
    guildId: string;
    items: IInventoryItem[];
}

const InventoryItemSchema = new Schema({
    itemId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["role", "xp_boost", "badge", "ai_perk"], required: true },
    quantity: { type: Number, default: 1, min: 0 },
    acquiredAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    consumed: { type: Boolean, default: false },
    badgeEmoji: { type: String },
    boostMultiplier: { type: Number },
    boostDurationMs: { type: Number },
    aiCooldownReductionMs: { type: Number },
});

const InventorySchema: Schema = new Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    items: [InventoryItemSchema],
});

InventorySchema.index({ userId: 1, guildId: 1 }, { unique: true });

export const Inventory = mongoose.model<IInventory>("Inventory", InventorySchema);

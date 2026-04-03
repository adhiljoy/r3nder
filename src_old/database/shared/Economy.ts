import mongoose, { Schema, Document } from "mongoose";

export interface IEconomy extends Document {
    userId: string;
    guildId: string;
    coins: number;
    lastDaily: Date | null;
    dailyStreak: number;
}

const EconomySchema: Schema = new Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    coins: { type: Number, default: 0, min: 0 },
    lastDaily: { type: Date, default: null },
    dailyStreak: { type: Number, default: 0 },
});

EconomySchema.index({ userId: 1, guildId: 1 }, { unique: true });

export const Economy = mongoose.model<IEconomy>("Economy", EconomySchema);

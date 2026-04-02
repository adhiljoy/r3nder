import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    userId: string;
    guildId: string;
    xp: number;
    level: number;
    birthday?: Date;
    reminders: {
        message: string;
        time: Date;
        createdAt: Date;
    }[];
    nickname?: string;
    interactionCount: number;
    nicknameAsked: boolean;
    premiumTier: "free" | "pro" | "ultra";
}

const UserSchema: Schema = new Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    birthday: { type: Date },
    reminders: [{
        message: { type: String, required: true },
        time: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    nickname: { type: String },
    interactionCount: { type: Number, default: 0 },
    nicknameAsked: { type: Boolean, default: false },
    premiumTier: { type: String, enum: ["free", "pro", "ultra"], default: "free" },
});

export const User = mongoose.model<IUser>("User", UserSchema);

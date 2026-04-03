import mongoose, { Schema, Document } from "mongoose";

export interface IAIContext extends Document {
    userId: string;
    guildId: string;
    channelId: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: Date;
}

const AIContextSchema: Schema = new Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: "24h" }, // TTL: messages expire after 24h
});

// Create an index for efficient retrieval of recent history
AIContextSchema.index({ userId: 1, guildId: 1, createdAt: -1 });

export const AIContext = mongoose.model<IAIContext>("AIContext", AIContextSchema);

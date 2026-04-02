import mongoose, { Schema, Document } from "mongoose";

export interface IAnalytics extends Document {
    guildId: string;
    date: Date;
    resolution: "daily" | "hourly" | "15min";
    messages: number;
    voiceMinutes: number;
    voiceAttendance: number; // Max concurrent users
    activeUsers: number; // Unique users in bucket
    topUsers: {
        userId: string;
        messageCount: number;
    }[];
    commands: {
        name: string;
        count: number;
    }[];
}

const AnalyticsSchema: Schema = new Schema({
    guildId: { type: String, required: true, index: true },
    date: { type: Date, default: Date.now, index: true },
    resolution: { type: String, enum: ["daily", "hourly", "15min"], default: "daily", index: true },
    messages: { type: Number, default: 0 },
    voiceMinutes: { type: Number, default: 0 },
    voiceAttendance: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    topUsers: [{
        userId: { type: String, required: true },
        messageCount: { type: Number, default: 0 }
    }],
    commands: [{
        name: { type: String, required: true },
        count: { type: Number, default: 0 }
    }]
});

// TTL index for high-resolution data (keep 15min data for 7 days, hourly for 30 days)
// Logic for different TTLs would normally be handled in application code or multiple collections, 
// here we'll use a single index for simplicity but optimized for query performance.
AnalyticsSchema.index({ guildId: 1, date: -1, resolution: 1 });

export const Analytics = mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);

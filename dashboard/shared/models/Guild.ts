import mongoose, { Schema, Document } from "mongoose";

export interface IGuild extends Document {
    guildId: string;
    prefix: string;
    automod: {
        enabled: boolean;
        antiLink: boolean;
        modRoles: string[];
    };
    music: {
        defaultVolume: number;
        autoPlay: boolean;
        djRole: string | null;
    };
    economy: {
        enabled: boolean;
        startingBalance: number;
    };
    birthday: {
        channelId: string | null;
        message: string;
        roleRewardId: string | null;
    };
    aiAutopilot: {
        enabled: boolean;
        autoReply: boolean;
        mentionResponse: boolean;
        toxicityFilter: boolean;
        inactiveEngage: boolean;
        engagementInterval: number;
        personality: "normal" | "funny" | "coder" | "strict";
        allowedUsers: string[];
    };

    logChannelId: string | null;
    appearance: {
        accentColor: string;
        themeMode: "dark" | "glass" | "amoled";
    };
}


const GuildSchema: Schema = new Schema({
    guildId: { type: String, required: true, unique: true },
    prefix: { type: String, default: "!" },
    automod: {
        enabled: { type: Boolean, default: false },
        antiLink: { type: Boolean, default: false },
        modRoles: { type: [String], default: [] },
    },
    music: {
        defaultVolume: { type: Number, default: 100 },
        autoPlay: { type: Boolean, default: false },
        djRole: { type: String, default: null },
    },
    economy: {
        enabled: { type: Boolean, default: true },
        startingBalance: { type: Number, default: 0 },
    },
    birthday: {
        channelId: { type: String, default: null },
        message: { type: String, default: "🎂 Happy Birthday {user}! R3NDER wishes you an amazing day! ✨" },
        roleRewardId: { type: String, default: null },
    },
    aiAutopilot: {
        enabled: { type: Boolean, default: false },
        autoReply: { type: Boolean, default: true },
        mentionResponse: { type: Boolean, default: true },
        toxicityFilter: { type: Boolean, default: true },
        inactiveEngage: { type: Boolean, default: true },
        engagementInterval: { type: Number, default: 4 },
        personality: { type: String, enum: ["normal", "funny", "coder", "strict"], default: "normal" },
        allowedUsers: { type: [String], default: [] },
    },

    logChannelId: { type: String, default: null },
    appearance: {
        accentColor: { type: String, default: "#5865F2" },
        themeMode: { type: String, enum: ["dark", "glass", "amoled"], default: "glass" },
    },
});


export const Guild = mongoose.model<IGuild>("Guild", GuildSchema);

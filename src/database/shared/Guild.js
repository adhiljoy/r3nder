"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Guild = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const GuildSchema = new mongoose_1.Schema({
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
exports.Guild = mongoose_1.default.model("Guild", GuildSchema);

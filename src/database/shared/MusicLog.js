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
exports.MusicLog = exports.MusicEventType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// ─── Music Event Types ───────────────────────────────────────────────────────
var MusicEventType;
(function (MusicEventType) {
    MusicEventType["MUSIC_PLAY"] = "MUSIC_PLAY";
    MusicEventType["MUSIC_PAUSE"] = "MUSIC_PAUSE";
    MusicEventType["MUSIC_RESUME"] = "MUSIC_RESUME";
    MusicEventType["MUSIC_SKIP"] = "MUSIC_SKIP";
    MusicEventType["MUSIC_STOP"] = "MUSIC_STOP";
    MusicEventType["QUEUE_ADD"] = "QUEUE_ADD";
    MusicEventType["VOLUME_CHANGE"] = "VOLUME_CHANGE";
    MusicEventType["SHUFFLE"] = "SHUFFLE";
    MusicEventType["LOOP_TOGGLE"] = "LOOP_TOGGLE";
    MusicEventType["TRACK_END"] = "TRACK_END";
    MusicEventType["TRACK_ERROR"] = "TRACK_ERROR";
})(MusicEventType || (exports.MusicEventType = MusicEventType = {}));
// ─── Schema ───────────────────────────────────────────────────────────────────
const MusicLogSchema = new mongoose_1.Schema({
    guildId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    username: { type: String, default: "Unknown" },
    event: { type: String, enum: Object.values(MusicEventType), required: true, index: true },
    trackTitle: { type: String, required: true },
    trackUrl: { type: String, default: "" },
    trackAuthor: { type: String, default: "Unknown" },
    source: { type: String, default: "unknown" },
    volume: { type: Number },
    duration: { type: Number },
    timestamp: { type: Date, default: Date.now },
});
// TTL: auto-purge after 90 days (put before compound indexes to avoid duplicate warning)
MusicLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000, background: true });
// Compound indexes for analytics queries
MusicLogSchema.index({ guildId: 1, event: 1, timestamp: -1 });
MusicLogSchema.index({ guildId: 1, trackTitle: 1 });
exports.MusicLog = mongoose_1.default.model("MusicLog", MusicLogSchema, "music_logs");

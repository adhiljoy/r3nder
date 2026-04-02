import mongoose, { Schema, Document } from "mongoose";

// ─── Music Event Types ───────────────────────────────────────────────────────
export enum MusicEventType {
    MUSIC_PLAY    = "MUSIC_PLAY",
    MUSIC_PAUSE   = "MUSIC_PAUSE",
    MUSIC_RESUME  = "MUSIC_RESUME",
    MUSIC_SKIP    = "MUSIC_SKIP",
    MUSIC_STOP    = "MUSIC_STOP",
    QUEUE_ADD     = "QUEUE_ADD",
    VOLUME_CHANGE = "VOLUME_CHANGE",
    SHUFFLE       = "SHUFFLE",
    LOOP_TOGGLE   = "LOOP_TOGGLE",
    TRACK_END     = "TRACK_END",
    TRACK_ERROR   = "TRACK_ERROR",
}

// ─── Interface ───────────────────────────────────────────────────────────────
export interface IMusicLog extends Document {
    guildId:    string;
    userId:     string;
    username:   string;
    event:      MusicEventType;
    trackTitle: string;
    trackUrl:   string;
    trackAuthor?: string;
    source?:    string;       // "soundcloud" | "youtube" | "direct"
    volume?:    number;
    duration?:  number;       // seconds
    timestamp:  Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const MusicLogSchema: Schema = new Schema({
    guildId:    { type: String, required: true, index: true },
    userId:     { type: String, required: true, index: true },
    username:   { type: String, default: "Unknown" },
    event:      { type: String, enum: Object.values(MusicEventType), required: true, index: true },
    trackTitle: { type: String, required: true },
    trackUrl:   { type: String, default: "" },
    trackAuthor:{ type: String, default: "Unknown" },
    source:     { type: String, default: "unknown" },
    volume:     { type: Number },
    duration:   { type: Number },
    timestamp:  { type: Date, default: Date.now },
});

// TTL: auto-purge after 90 days (put before compound indexes to avoid duplicate warning)
MusicLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000, background: true });

// Compound indexes for analytics queries
MusicLogSchema.index({ guildId: 1, event: 1, timestamp: -1 });
MusicLogSchema.index({ guildId: 1, trackTitle: 1 });

export const MusicLog = mongoose.model<IMusicLog>("MusicLog", MusicLogSchema, "music_logs");

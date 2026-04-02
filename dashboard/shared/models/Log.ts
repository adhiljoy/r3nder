import mongoose, { Schema, Document } from "mongoose";

export enum LogPriority {
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
    CRITICAL = "critical"
}

export enum LogType {
    MESSAGE = "message",
    COMMAND = "command",
    MOD = "mod",
    AI = "ai",
    SYSTEM = "system",
    ERROR = "error",
    VOICE = "voice",
    JOIN_LEAVE = "join_leave"
}

export interface ILog extends Document {
    userId?: string;
    guildId?: string;
    type: LogType;
    priority: LogPriority;
    action: string;
    targetId?: string;
    content: string;
    changes?: any;
    metadata?: any;
    timestamp: Date;
}

const LogSchema: Schema = new Schema({
    userId: { type: String, index: true },
    guildId: { type: String, index: true },
    type: { type: String, enum: Object.values(LogType), required: true, index: true },
    priority: { type: String, enum: Object.values(LogPriority), default: LogPriority.INFO, index: true },
    action: { type: String, required: true, index: true },
    targetId: { type: String, index: true },
    content: { type: String, required: true },
    changes: { type: Schema.Types.Mixed },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now }
});

// TTL Index for auto-cleanup (60 days)
LogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 5184000 });

// Case-insensitive text search index on content
LogSchema.index({ content: "text" });

export const Log = mongoose.model<ILog>("Log", LogSchema);

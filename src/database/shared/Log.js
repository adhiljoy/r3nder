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
exports.Log = exports.LogType = exports.LogPriority = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var LogPriority;
(function (LogPriority) {
    LogPriority["INFO"] = "info";
    LogPriority["WARN"] = "warn";
    LogPriority["ERROR"] = "error";
    LogPriority["CRITICAL"] = "critical";
})(LogPriority || (exports.LogPriority = LogPriority = {}));
var LogType;
(function (LogType) {
    LogType["MESSAGE"] = "message";
    LogType["COMMAND"] = "command";
    LogType["MOD"] = "mod";
    LogType["AI"] = "ai";
    LogType["SYSTEM"] = "system";
    LogType["ERROR"] = "error";
    LogType["VOICE"] = "voice";
    LogType["JOIN_LEAVE"] = "join_leave";
    LogType["MUSIC"] = "music";
})(LogType || (exports.LogType = LogType = {}));
const LogSchema = new mongoose_1.Schema({
    userId: { type: String, index: true },
    guildId: { type: String, index: true },
    type: { type: String, enum: Object.values(LogType), required: true, index: true },
    priority: { type: String, enum: Object.values(LogPriority), default: LogPriority.INFO, index: true },
    action: { type: String, required: true, index: true },
    targetId: { type: String, index: true },
    content: { type: String, required: true },
    changes: { type: mongoose_1.Schema.Types.Mixed },
    metadata: { type: mongoose_1.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now }
});
// TTL Index for auto-cleanup (60 days)
LogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 5184000 });
// Case-insensitive text search index on content
LogSchema.index({ content: "text" });
exports.Log = mongoose_1.default.model("Log", LogSchema);

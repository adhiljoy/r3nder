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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns = __importStar(require("node:dns"));
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const database_1 = require("@utils/database");
const Guild_1 = require("@database/Guild");
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../../../.env") });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const axios_1 = __importDefault(require("axios"));
const Admin_1 = __importDefault(require("./routes/Admin"));
const auth_routes_1 = __importDefault(require("@routes/auth.routes"));
const User_1 = require("@database/User");
const MusicLog_1 = require("@database/MusicLog");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173", "https://r3nder-x18m.vercel.app"],
        credentials: true
    }
});
const Log_1 = require("@database/Log");
const BOT_API_URL = "http://localhost:3002";
// Utility to deep-diff two objects
const getDiff = (oldObj, newObj, path = "") => {
    const diff = {};
    for (const key in newObj) {
        const currentPath = path ? `${path}.${key}` : key;
        if (newObj[key] !== null && typeof newObj[key] === "object" && !Array.isArray(newObj[key])) {
            const nestedDiff = getDiff(oldObj[key] || {}, newObj[key], currentPath);
            Object.assign(diff, nestedDiff);
        }
        else if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
            diff[currentPath] = { old: oldObj[key], new: newObj[key] };
        }
    }
    return diff;
};
// Utility to send logs to Bot
const logEvent = async (data) => {
    try {
        await axios_1.default.post(`${BOT_API_URL}/log`, data);
    }
    catch (error) {
        console.error("[Dashboard Log Sync Error]", error);
    }
};
// MongoDB Connection using Shared Utility
const connectDB = async () => {
    await database_1.DatabaseUtils.connect(process.env.MONGO_URI, "Dashboard-API", {
        maxRetries: 3,
        retryDelay: 5000,
        dbName: "r3nder",
    });
};
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "https://r3nder-x18m.vercel.app"],
    credentials: true
}));
app.use(express_1.default.json());
// Session Configuration
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "r3nder-secret",
    resave: false,
    saveUninitialized: false,
    store: connect_mongo_1.default.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
        maxAge: 60000 * 60 * 24 * 7, // 1 week
    }
}));
const isAuth = (req, res, next) => {
    if (req.session.user)
        return next();
    res.status(401).json({ message: "Unauthorized" });
};
const checkAdmin = (req, res, next) => {
    const adminIds = (process.env.ADMIN_IDS || "").split(",");
    const user = req.session.user;
    if (user && adminIds.includes(user.id))
        return next();
    res.status(403).json({ message: "Admin access denied" });
};
// ─── AUTH ROUTES ───────────────────────────────────────────────────
app.use("/", auth_routes_1.default);
app.get("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out" });
    });
});
// Admin API Router
app.use("/api/admin", isAuth, checkAdmin, Admin_1.default);
// Profile & Identity Routes
app.get("/api/user", isAuth, (req, res) => {
    const adminIds = (process.env.ADMIN_IDS || "").split(",");
    const user = req.session.user;
    const isAdmin = user && adminIds.includes(user.id);
    res.json({ ...user, isAdmin, clientId: process.env.CLIENT_ID });
});
// User Self-Management Routes
app.get("/api/user/profile", isAuth, async (req, res) => {
    try {
        const userData = await User_1.User.findOne({ userId: req.user.id });
        res.json(userData || { userId: req.user.id, birthday: null, reminders: [] });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch profile" });
    }
});
app.post("/api/user/birthday", isAuth, async (req, res) => {
    const { birthday } = req.body;
    try {
        const oldUser = await User_1.User.findOne({ userId: req.user.id });
        await User_1.User.findOneAndUpdate({ userId: req.user.id }, { birthday: new Date(birthday) }, { upsert: true });
        logEvent({
            type: Log_1.LogType.SYSTEM,
            priority: Log_1.LogPriority.INFO,
            action: "UPDATE_BIRTHDAY",
            content: `User ${req.user.username} updated their birthday`,
            userId: req.user.id,
            changes: { birthday: { old: oldUser?.birthday, new: birthday } }
        });
        res.json({ success: true, birthday });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update birthday" });
    }
});
app.post("/api/user/reminder", isAuth, async (req, res) => {
    const { message, time } = req.body;
    try {
        const newReminder = { message, time: new Date(time), createdAt: new Date() };
        await User_1.User.findOneAndUpdate({ userId: req.user.id }, { $push: { reminders: newReminder } }, { upsert: true });
        logEvent({
            type: Log_1.LogType.SYSTEM,
            priority: Log_1.LogPriority.INFO,
            action: "CREATE_REMINDER",
            content: `User ${req.user.username} created a reminder: ${message.slice(0, 30)}`,
            userId: req.user.id,
            metadata: { message, time }
        });
        res.json({ success: true, reminder: newReminder });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create reminder" });
    }
});
app.delete("/api/user/reminder/:id", isAuth, async (req, res) => {
    const reminderId = req.params.id;
    try {
        await User_1.User.findOneAndUpdate({ userId: req.user.id }, { $pull: { reminders: { _id: reminderId } } });
        logEvent({
            type: Log_1.LogType.SYSTEM,
            priority: Log_1.LogPriority.INFO,
            action: "DELETE_REMINDER",
            content: `User ${req.user.username} deleted a reminder`,
            userId: req.user.id,
            metadata: { reminderId }
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete reminder" });
    }
});
// Middleware to check if user is a member of the guild
const isMember = (req, res, next) => {
    const guildId = req.params.id || req.params.guildId;
    const userGuilds = req.user.guilds;
    const isMemberOfGuild = userGuilds.some((g) => g.id === guildId);
    if (!isMemberOfGuild) {
        return res.status(403).json({ error: "Access denied. You are not a member of this server." });
    }
    next();
};
app.get("/api/guild/:id/analytics", isAuth, isMember, async (req, res) => {
    const guildId = req.params.id;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    try {
        // Fetch 15-min resolution data for the last 24h
        const timeline = await Analytics_1.Analytics.find({
            guildId,
            resolution: "15min",
            date: { $gte: yesterday }
        }).sort({ date: 1 });
        // Fetch daily data for overall stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daily = await Analytics_1.Analytics.findOne({ guildId, date: today, resolution: "daily" });
        // Fetch top active users in the last 24h
        const topUsers = await Log_1.Log.aggregate([
            { $match: { guildId, timestamp: { $gte: yesterday } } },
            { $group: { _id: "$userId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        // Fetch command usage trends
        const commandTrends = await Log_1.Log.aggregate([
            { $match: { guildId, type: Log_1.LogType.COMMAND, timestamp: { $gte: yesterday } } },
            { $group: { _id: "$action", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.json({
            timeline: timeline.map((t) => ({
                time: t.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                messages: t.messages,
                activeUsers: t.activeUsers,
                voice: t.voiceAttendance
            })),
            stats: {
                totalMessages24h: daily?.messages || 0,
                activeUsers: daily?.activeUsers || 0,
                voiceAttendance: daily?.voiceAttendance || 0,
                topCommands: commandTrends.map((c) => ({ name: c._id, count: c.count })),
                topUsers: topUsers.map((u) => ({ id: u._id, activity: u.count }))
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
});
app.get("/api/guild/:id/logs", isAuth, isMember, async (req, res) => {
    const { page = 1, limit = 20, type } = req.query;
    const guildId = req.params.id;
    const skip = (Number(page) - 1) * Number(limit);
    const query = { guildId };
    if (type)
        query.type = type;
    try {
        const logs = await Log_1.Log.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await Log_1.Log.countDocuments(query);
        res.json({
            logs,
            total,
            pages: Math.ceil(total / Number(limit)),
            currentPage: Number(page)
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch guild logs" });
    }
});
app.get("/api/guilds", isAuth, async (req, res) => {
    try {
        const userGuilds = req.user.guilds;
        const manageGuilds = userGuilds.filter((g) => (parseInt(g.permissions) & 0x8) === 0x8 || (parseInt(g.permissions) & 0x20) === 0x20); // Admin or Manage Server
        // Check which guilds have the bot via real-time presence API
        let botPresence = {};
        try {
            const guildIds = manageGuilds.map((g) => g.id);
            const response = await axios_1.default.post(`${BOT_API_URL}/guilds/presence`, { guildIds }, { timeout: 2000 });
            botPresence = response.data;
        }
        catch (error) {
            const botGuilds = await Guild_1.Guild.find({ guildId: { $in: manageGuilds.map((g) => g.id) } });
            botGuilds.forEach((bg) => { botPresence[bg.guildId] = true; });
        }
        const result = manageGuilds.map((g) => ({
            ...g,
            botInstalled: !!botPresence[g.id]
        }));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch guilds" });
    }
});
app.get("/api/guild/:id/settings", isAuth, async (req, res) => {
    const guildId = req.params.id;
    let guild = await Guild_1.Guild.findOne({ guildId });
    if (!guild) {
        guild = await Guild_1.Guild.create({ guildId });
    }
    res.json(guild);
});
const Analytics_1 = require("@database/Analytics");
// ... (existing code)
app.get("/api/guild/:id/music", isAuth, async (req, res) => {
    try {
        const response = await axios_1.default.get(`${BOT_API_URL}/music/${req.params.id}`);
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ playing: false, error: "Bot is offline or unreachable" });
    }
});
app.get("/api/guild/:id/music/logs", isAuth, async (req, res) => {
    try {
        const logs = await MusicLog_1.MusicLog.find({ guildId: req.params.id })
            .sort({ timestamp: -1 })
            .limit(20);
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ message: "Music log retrieval failure" });
    }
});
app.post("/api/guild/:id/music/control", isAuth, async (req, res) => {
    try {
        const response = await axios_1.default.post(`${BOT_API_URL}/music/${req.params.id}/control`, req.body);
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Bot is offline or unreachable" });
    }
});
app.get("/api/guild/:id/analytics", isAuth, async (req, res) => {
    const guildId = req.params.id;
    // Fetch last 7 days of analytics
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const stats = await Analytics_1.Analytics.find({
        guildId,
        date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 });
    res.json(stats);
});
app.post("/api/guild/:id/settings", isAuth, async (req, res) => {
    const guildId = req.params.id;
    const newSettings = req.body;
    try {
        const oldGuild = await Guild_1.Guild.findOne({ guildId });
        const diff = getDiff(oldGuild?.toObject() || {}, newSettings);
        await Guild_1.Guild.findOneAndUpdate({ guildId }, newSettings, { upsert: true });
        // Log the change
        if (Object.keys(diff).length > 0) {
            logEvent({
                type: Log_1.LogType.SYSTEM,
                priority: Log_1.LogPriority.INFO,
                action: "UPDATE_SETTINGS",
                content: `Settings updated for guild ${guildId} by ${req.user.username}`,
                userId: req.user.id,
                guildId: guildId,
                changes: diff
            });
        }
        res.json({ message: "Settings updated", diff });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update settings" });
    }
});
app.post("/api/guild/:id/command", isAuth, async (req, res) => {
    try {
        const response = await axios_1.default.post(`${BOT_API_URL}/guild/${req.params.id}/command`, req.body);
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Bot is offline or unreachable" });
    }
});
// WebSocket Logic
io.on("connection", (socket) => {
    const { guildId } = socket.handshake.query;
    if (guildId) {
        socket.join(`guild:${guildId}`);
        console.log(`[Socket] Client joined guild room: ${guildId}`);
    }
    socket.on("disconnect", () => {
        console.log("[Socket] Client disconnected");
    });
});
// Endpoint for bot to push logs to dashboard real-time
app.post("/api/internal/logs/push", async (req, res) => {
    const log = req.body;
    if (log.guildId) {
        io.to(`guild:${log.guildId}`).emit("new_log", log);
    }
    // Also push to admin rooms
    io.to("admin").emit("new_log", log);
    res.sendStatus(200);
});
// Start Server only after DB Connection
const PORT = process.env.PORT || 3001;
const startServer = async () => {
    try {
        await connectDB();
        httpServer.listen(PORT, () => console.log(`🚀 Dashboard Server running on port ${PORT}`));
    }
    catch (error) {
        console.error("🚨 Critical Error: Could not connect to MongoDB. Exiting Dashboard Server.");
        process.exit(1);
    }
};
startServer();

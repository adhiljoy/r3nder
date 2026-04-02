import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { DatabaseUtils } from "@utils/database";
import { Guild } from "@database/Guild";

dotenv.config({ path: path.join(__dirname, "../../../.env") });

import { createServer } from "http";
import { Server } from "socket.io";
import axios from "axios";
import adminRouter from "./routes/Admin";

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:5173"],
        credentials: true
    }
});

import { LogType, LogPriority } from "@database/Log";

const BOT_API_URL = "http://localhost:3002";

// Utility to deep-diff two objects
const getDiff = (oldObj: any, newObj: any, path: string = ""): any => {
    const diff: any = {};
    for (const key in newObj) {
        const currentPath = path ? `${path}.${key}` : key;
        if (newObj[key] !== null && typeof newObj[key] === "object" && !Array.isArray(newObj[key])) {
            const nestedDiff = getDiff(oldObj[key] || {}, newObj[key], currentPath);
            Object.assign(diff, nestedDiff);
        } else if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
            diff[currentPath] = { old: oldObj[key], new: newObj[key] };
        }
    }
    return diff;
};

// Utility to send logs to Bot
const logEvent = async (data: any) => {
    try {
        await axios.post(`${BOT_API_URL}/log`, data);
    } catch (error) {
        console.error("[Dashboard Log Sync Error]", error);
    }
};

// MongoDB Connection using Shared Utility
const connectDB = async () => {
    await DatabaseUtils.connect(
        process.env.MONGO_URI!,
        "Dashboard-API",
        {
            maxRetries: 3,
            retryDelay: 5000,
            dbName: "r3nder",
        }
    );
};

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true
}));

app.use(express.json());

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || "r3nder-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
        maxAge: 60000 * 60 * 24 * 7, // 1 week
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport Discord Strategy
passport.use(new DiscordStrategy({
    clientID: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    callbackURL: process.env.CALLBACK_URL!,
    scope: ["identify", "guilds", "email"]
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));


console.log(`[Dashboard-Auth] Client ID: ${process.env.CLIENT_ID}`);
console.log(`[Dashboard-Auth] Redirect URI: ${process.env.CALLBACK_URL}`);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

// Bit-perfect Meta Hardcoding
const pkg = { version: "1.0.0" };

// Middleware to check authentication
import { User } from "@database/User";

const isAuth = (req: any, res: any, next: any) => {
    if (req.user) return next();
    res.status(401).json({ message: "Unauthorized" });
};

const checkPremium = (tier: string) => async (req: any, res: any, next: any) => {
    const userData = await User.findOne({ userId: (req.user as any).id });
    if (!userData) return res.status(404).json({ message: "User not found" });

    const tiers = ["free", "pro", "ultra"];
    if (tiers.indexOf(userData.premiumTier) >= tiers.indexOf(tier)) {
        return next();
    }
    res.status(403).json({ message: `Requires ${tier} subscription` });
};

const checkAdmin = (req: any, res: any, next: any) => {
    const adminIds = (process.env.ADMIN_IDS || "").split(",");
    const adminEmail = "adhiljoyappu@gmail.com".toLowerCase();
    const adminUsername = "renderexe".toLowerCase();

    const user = req.user as any;
    const isAdmin = user && (
        adminIds.includes(user.id) || 
        user.email?.toLowerCase() === adminEmail || 
        user.username?.toLowerCase() === adminUsername
    );

    if (isAdmin) return next();


    // Log unauthorized attempt
    logEvent({
        type: LogType.SYSTEM,
        priority: LogPriority.CRITICAL,
        action: "UNAUTHORIZED_ADMIN_ACCESS",
        content: `Unauthorized access attempt to /admin by ${user?.username || "Unknown"} (${user?.id || "N/A"})`,
        userId: user?.id,
        metadata: { ip: req.ip, userAgent: req.headers["user-agent"] }
    });

    res.status(403).json({ message: "Admin access denied" });
};


import { Log } from "@database/Log";
import { MusicLog, MusicEventType } from "@database/MusicLog";


// ─── Music Analytics Routes ────────────────────────────────────────────────
/**
 * GET /api/music/:guildId/logs
 * Full music analytics for a guild: recent plays, most played, active users, skip rate
 */
app.get("/api/music/:guildId/logs", isAuth, async (req: any, res: any) => {
    const { guildId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    try {
        // Recent play events
        const recentPlays = await MusicLog.find({ guildId, event: MusicEventType.MUSIC_PLAY })
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean();

        // Most played songs (aggregate by trackTitle)
        const mostPlayed = await MusicLog.aggregate([
            { $match: { guildId, event: MusicEventType.MUSIC_PLAY } },
            { $group: { _id: "$trackTitle", count: { $sum: 1 }, trackUrl: { $first: "$trackUrl" }, trackAuthor: { $first: "$trackAuthor" }, source: { $first: "$source" } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);

        // Most active users
        const activeUsers = await MusicLog.aggregate([
            { $match: { guildId, event: MusicEventType.QUEUE_ADD } },
            { $group: { _id: "$userId", username: { $first: "$username" }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);

        // Skip rate: skips / plays
        const totalPlays = await MusicLog.countDocuments({ guildId, event: MusicEventType.MUSIC_PLAY });
        const totalSkips = await MusicLog.countDocuments({ guildId, event: MusicEventType.MUSIC_SKIP });
        const skipRate   = totalPlays > 0 ? ((totalSkips / totalPlays) * 100).toFixed(1) : "0.0";

        // Volume change history
        const volumeHistory = await MusicLog.find({ guildId, event: MusicEventType.VOLUME_CHANGE })
            .sort({ timestamp: -1 })
            .limit(20)
            .lean();

        res.json({
            guildId,
            summary: {
                totalPlays,
                totalSkips,
                skipRate: `${skipRate}%`,
                totalQueued: await MusicLog.countDocuments({ guildId, event: MusicEventType.QUEUE_ADD }),
            },
            recentPlays,
            mostPlayed: mostPlayed.map((m: any) => ({
                title:      m._id,
                plays:      m.count,
                url:        m.trackUrl,
                author:     m.trackAuthor,
                source:     m.source,
            })),
            activeUsers: activeUsers.map((u: any) => ({
                userId:   u._id,
                username: u.username,
                tracks:   u.count,
            })),
            volumeHistory,
        });
    } catch (err: any) {
        res.status(500).json({ error: "Music analytics query failed", message: err.message });
    }
});


// Auth Routes
app.post("/api/premium/upgrade", isAuth, async (req, res) => {
    const { tier } = req.body;
    try {
        await User.findOneAndUpdate(
            { userId: (req.user as any).id }, 
            { premiumTier: tier }, 
            { upsert: true }
        );
        res.json({ success: true, tier });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.get("/auth/login", passport.authenticate("discord"));
app.get("/auth/callback", passport.authenticate("discord", {
    failureRedirect: "/auth/login",
}), (req: any, res) => {
    const adminIds = (process.env.ADMIN_IDS || "").split(",");
    const adminEmail = "adhiljoyappu@gmail.com";
    const adminUsername = "renderexe";

    const isAdmin = req.user && (
        adminIds.includes(req.user.id) || 
        req.user.email === adminEmail || 
        req.user.username === adminUsername
    );

    if (isAdmin) {
        res.redirect("http://localhost:5173/core/overview");
    } else {
        res.redirect("http://localhost:5173/portal");
    }
});



app.get("/api/auth/logout", (req: any, res) => {
    req.logout(() => res.json({ message: "Logged out" }));
});

// Admin API Router
app.use("/api/admin", isAuth, checkAdmin, adminRouter);

// Profile & Identity Routes
app.get("/api/user", isAuth, (req: any, res) => {
    const adminIds = (process.env.ADMIN_IDS || "").split(",");
    const adminEmail = "adhiljoyappu@gmail.com".toLowerCase();
    const adminUsername = "renderexe".toLowerCase();

    const isAdmin = req.user && (
        adminIds.includes(req.user.id) || 
        req.user.email?.toLowerCase() === adminEmail || 
        req.user.username?.toLowerCase() === adminUsername
    );
    res.json({ ...req.user, isAdmin, clientId: process.env.CLIENT_ID });
});




// User Self-Management Routes
app.get("/api/user/profile", isAuth, async (req: any, res) => {
    try {
        const userData = await User.findOne({ userId: req.user.id });
        res.json(userData || { userId: req.user.id, birthday: null, reminders: [] });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch profile" });
    }
});

app.post("/api/user/birthday", isAuth, async (req: any, res) => {
    const { birthday } = req.body;
    try {
        const oldUser = await User.findOne({ userId: req.user.id });
        await User.findOneAndUpdate(
            { userId: req.user.id },
            { birthday: new Date(birthday) },
            { upsert: true }
        );

        logEvent({
            type: LogType.SYSTEM,
            priority: LogPriority.INFO,
            action: "UPDATE_BIRTHDAY",
            content: `User ${req.user.username} updated their birthday`,
            userId: req.user.id,
            changes: { birthday: { old: oldUser?.birthday, new: birthday } }
        });

        res.json({ success: true, birthday });
    } catch (error) {
        res.status(500).json({ message: "Failed to update birthday" });
    }
});

app.post("/api/user/reminder", isAuth, async (req: any, res) => {
    const { message, time } = req.body;
    try {
        const newReminder = { message, time: new Date(time), createdAt: new Date() };
        await User.findOneAndUpdate(
            { userId: req.user.id },
            { $push: { reminders: newReminder } },
            { upsert: true }
        );


        logEvent({
            type: LogType.SYSTEM,
            priority: LogPriority.INFO,
            action: "CREATE_REMINDER",
            content: `User ${req.user.username} created a reminder: ${message.slice(0, 30)}`,
            userId: req.user.id,
            metadata: { message, time }
        });

        res.json({ success: true, reminder: newReminder });
    } catch (error) {
        res.status(500).json({ message: "Failed to create reminder" });
    }
});

app.delete("/api/user/reminder/:id", isAuth, async (req: any, res) => {
    const reminderId = req.params.id;
    try {
        await User.findOneAndUpdate(
            { userId: req.user.id },
            { $pull: { reminders: { _id: reminderId } } }
        );

        logEvent({
            type: LogType.SYSTEM,
            priority: LogPriority.INFO,
            action: "DELETE_REMINDER",
            content: `User ${req.user.username} deleted a reminder`,
            userId: req.user.id,
            metadata: { reminderId }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete reminder" });
    }
});

// Middleware to check if user is a member of the guild
const isMember = (req: any, res: any, next: any) => {
    const guildId = req.params.id || req.params.guildId;
    const userGuilds = req.user.guilds;
    const isMemberOfGuild = userGuilds.some((g: any) => g.id === guildId);
    
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
        const timeline = await Analytics.find({
            guildId,
            resolution: "15min",
            date: { $gte: yesterday }
        }).sort({ date: 1 });

        // Fetch daily data for overall stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daily = await Analytics.findOne({ guildId, date: today, resolution: "daily" });

        // Fetch top active users in the last 24h
        const topUsers = await Log.aggregate([
            { $match: { guildId, timestamp: { $gte: yesterday } } },
            { $group: { _id: "$userId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Fetch command usage trends
        const commandTrends = await Log.aggregate([
            { $match: { guildId, type: LogType.COMMAND, timestamp: { $gte: yesterday } } },
            { $group: { _id: "$action", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            timeline: timeline.map((t: any) => ({
                time: t.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                messages: t.messages,
                activeUsers: t.activeUsers,
                voice: t.voiceAttendance
            })),
            stats: {
                totalMessages24h: daily?.messages || 0,
                activeUsers: daily?.activeUsers || 0,
                voiceAttendance: daily?.voiceAttendance || 0,
                topCommands: commandTrends.map((c: any) => ({ name: c._id, count: c.count })),
                topUsers: topUsers.map((u: any) => ({ id: u._id, activity: u.count }))
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
});

app.get("/api/guild/:id/logs", isAuth, isMember, async (req, res) => {
    const { page = 1, limit = 20, type } = req.query;
    const guildId = req.params.id;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = { guildId };
    if (type) query.type = type;

    try {
        const logs = await Log.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(Number(limit));
        
        const total = await Log.countDocuments(query);

        res.json({
            logs,
            total,
            pages: Math.ceil(total / Number(limit)),
            currentPage: Number(page)
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch guild logs" });
    }
});

app.get("/api/guilds", isAuth, async (req: any, res) => {
    try {
        const userGuilds = req.user.guilds;
        const manageGuilds = userGuilds.filter((g: any) => (parseInt(g.permissions) & 0x8) === 0x8 || (parseInt(g.permissions) & 0x20) === 0x20); // Admin or Manage Server

        // Check which guilds have the bot via real-time presence API
        let botPresence: Record<string, boolean> = {};
        try {
            const guildIds = manageGuilds.map((g: any) => g.id);
            const response = await axios.post(`${BOT_API_URL}/guilds/presence`, { guildIds }, { timeout: 2000 });
            botPresence = response.data as Record<string, boolean>;

        } catch (error) {
            console.error("[Dashboard] Bot presence API check failed, falling back to database detection.");
            const botGuilds = await Guild.find({ guildId: { $in: manageGuilds.map((g: any) => g.id) } });
            botGuilds.forEach(bg => { botPresence[bg.guildId] = true; });
        }

        const result = manageGuilds.map((g: any) => ({
            ...g,
            botInstalled: !!botPresence[g.id]
        }));


        res.json(result);

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch guilds" });
    }
});


app.get("/api/guild/:id/settings", isAuth, async (req, res) => {
    const guildId = req.params.id;
    let guild = await Guild.findOne({ guildId });
    if (!guild) {
        guild = await Guild.create({ guildId });
    }
    res.json(guild);
});

import { Analytics } from "@database/Analytics";

// ... (existing code)

app.get("/api/guild/:id/music", isAuth, async (req, res) => {
    try {
        const response = await axios.get(`${BOT_API_URL}/music/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ playing: false, error: "Bot is offline or unreachable" });
    }
});

app.get("/api/guild/:id/music/logs", isAuth, async (req: any, res) => {
    try {
        const logs = await MusicLog.find({ guildId: req.params.id })
            .sort({ timestamp: -1 })
            .limit(20);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: "Music log retrieval failure" });
    }
});

app.post("/api/guild/:id/music/control", isAuth, async (req, res) => {
    try {
        const response = await axios.post(`${BOT_API_URL}/music/${req.params.id}/control`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, error: "Bot is offline or unreachable" });
    }
});

app.get("/api/guild/:id/analytics", isAuth, async (req, res) => {
    const guildId = req.params.id;
    
    // Fetch last 7 days of analytics
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const stats = await Analytics.find({ 
        guildId, 
        date: { $gte: sevenDaysAgo } 
    }).sort({ date: 1 });

    res.json(stats);
});

app.post("/api/guild/:id/settings", isAuth, async (req: any, res) => {
    const guildId = req.params.id;
    const newSettings = req.body;
    
    try {
        const oldGuild = await Guild.findOne({ guildId });
        const diff = getDiff(oldGuild?.toObject() || {}, newSettings);
        
        await Guild.findOneAndUpdate({ guildId }, newSettings, { upsert: true });
        
        // Log the change
        if (Object.keys(diff).length > 0) {
            logEvent({
                type: LogType.SYSTEM,
                priority: LogPriority.INFO,
                action: "UPDATE_SETTINGS",
                content: `Settings updated for guild ${guildId} by ${req.user.username}`,
                userId: req.user.id,
                guildId: guildId,
                changes: diff
            });
        }

        
        res.json({ message: "Settings updated", diff });
    } catch (error) {
        res.status(500).json({ message: "Failed to update settings" });
    }
});

app.post("/api/guild/:id/command", isAuth, async (req, res) => {
    try {
        const response = await axios.post(`${BOT_API_URL}/guild/${req.params.id}/command`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, error: "Bot is offline or unreachable" });
    }
});

// WebSocket Logic

io.on("connection", (socket: any) => {
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
    } catch (error) {
        console.error("🚨 Critical Error: Could not connect to MongoDB. Exiting Dashboard Server.");
        process.exit(1);
    }
};

startServer();

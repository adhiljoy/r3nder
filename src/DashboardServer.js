"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDashboard = void 0;
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const Guild_1 = require("./database/shared/Guild");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
/**
 * Merges Dashboard & API routes into the main monolithic Express app.
 * This resolves the "No open ports detected" issue on Render by using a single PORT.
 */
const setupDashboard = (app, client) => {
    // Session with Shared Database (MUST be before routes)
    app.use((0, cookie_parser_1.default)());
    app.use((0, express_session_1.default)({
        secret: process.env.SESSION_SECRET || "r3nder-secret",
        resave: false,
        saveUninitialized: false,
        store: connect_mongo_1.default.create({ mongoUrl: process.env.MONGO_URI }),
        cookie: {
            maxAge: 60000 * 60 * 24 * 7, // 1 week
            secure: process.env.NODE_ENV === "production", // Secure in production
            sameSite: "lax"
        }
    }));
    const isAuth = (req, res, next) => {
        if (req.session.user)
            return next();
        res.status(401).json({ message: "Unauthorized" });
    };
    // ─── AUTH ROUTES ───────────────────────────────────────────────────
    app.use("/", auth_routes_1.default);
    app.get("/api/user", isAuth, (req, res) => {
        const adminIds = (process.env.ADMIN_IDS || "").split(",");
        const user = req.session.user;
        const isAdmin = user && adminIds.includes(user.id);
        res.json({ ...user, isAdmin, clientId: process.env.CLIENT_ID });
    });
    // ─── GUILD MANAGEMENT ─────────────────────────────────────────────
    app.get("/api/guilds", isAuth, async (req, res) => {
        try {
            const user = req.session.user;
            const userGuilds = user.guilds || [];
            const adminIds = (process.env.ADMIN_IDS || "").split(",");
            const isAdmin = adminIds.includes(user.id);
            let finalGuilds = [];
            if (isAdmin) {
                finalGuilds = client.guilds.cache.map(g => ({
                    id: g.id,
                    name: g.name,
                    icon: g.icon,
                    botInstalled: true
                }));
            }
            else {
                finalGuilds = userGuilds
                    .filter((g) => {
                    const perms = BigInt(g.permissions);
                    return (perms & BigInt(0x8)) === BigInt(0x8) || (perms & BigInt(0x20)) === BigInt(0x20);
                })
                    .map((g) => ({
                    id: g.id,
                    name: g.name,
                    icon: g.icon,
                    botInstalled: client.guilds.cache.has(g.id)
                }));
            }
            res.json({ guilds: finalGuilds });
        }
        catch (error) {
            res.status(500).json({ error: "Failed to sync nexus state" });
        }
    });
    app.get("/api/guild/:id/settings", isAuth, async (req, res) => {
        try {
            let guild = await Guild_1.Guild.findOne({ guildId: req.params.id });
            if (!guild) {
                guild = await new Guild_1.Guild({ guildId: req.params.id }).save();
            }
            res.json(guild);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch nexus settings" });
        }
    });
    app.post("/api/guild/:id/settings", isAuth, async (req, res) => {
        try {
            const { id } = req.params;
            const newSettings = req.body;
            const guild = client.guilds.cache.get(id);
            if (guild && newSettings.nickname) {
                const botMember = await guild.members.fetch(client.user.id);
                if (botMember && botMember.nickname !== newSettings.nickname) {
                    await botMember.setNickname(newSettings.nickname).catch(() => { });
                }
            }
            await Guild_1.Guild.findOneAndUpdate({ guildId: id }, newSettings, { upsert: true });
            res.json({ success: true });
        }
        catch (error) {
            res.status(500).json({ error: "Nexus Sync Failure" });
        }
    });
    app.post("/api/guild/:id/command", isAuth, async (req, res) => {
        const { command, data } = req.body;
        const guild = client.guilds.cache.get(req.params.id);
        if (!guild)
            return res.status(404).json({ error: "Nexus not reachable by shared bot instance" });
        try {
            switch (command) {
                case "CHANGE_NICKNAME":
                    await guild.members.me?.setNickname(data.nickname);
                    res.json({ success: true });
                    break;
                case "SET_REMINDER":
                    const channel = guild.channels.cache.get(data.channelId);
                    if (channel?.send) {
                        setTimeout(() => {
                            channel.send(`⏰ **R3NDER REMINDER:** ${data.message}`);
                        }, data.delayMinutes * 60000);
                        res.json({ success: true });
                    }
                    else {
                        res.status(400).json({ error: "Target channel invalid" });
                    }
                    break;
                default:
                    res.status(400).json({ error: "Unknown orchestration command" });
            }
        }
        catch (error) {
            res.status(500).json({ error: "Command execution failure" });
        }
    });
    app.get("/api/guild/:id/music", isAuth, async (req, res) => {
        const status = client.music.getStatus(req.params.id);
        res.json(status || { playing: false });
    });
    // ─── ADMIN & TELEMETRY ─────────────────────────────────────────────
    app.get("/api/stats", async (req, res) => {
        try {
            res.json({
                totalServers: client.guilds.cache.size,
                totalUsers: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
                uptime: client.uptime,
                status: "READY"
            });
        }
        catch (error) {
            res.status(500).json({ error: "Telemetry Sync Failure" });
        }
    });
    app.get("/api/admin/stats", isAuth, async (req, res) => {
        const adminIds = (process.env.ADMIN_IDS || "").split(",");
        if (!adminIds.includes(req.session.user.id))
            return res.status(403).json({ error: "Access Denied" });
        res.json({
            nexusCount: client.guilds.cache.size,
            userCount: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
            uptime: Math.floor(client.uptime / 3600000) + "h",
            latency: client.ws.ping + "ms",
            status: "OPERATIONAL"
        });
    });
    console.log("✅ Dashboard & API Orchestrator initialized on primary port");
};
exports.setupDashboard = setupDashboard;

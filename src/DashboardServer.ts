import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import { R3NDERClient } from "./client/R3nderClient";
import { Guild } from "./database/shared/Guild";
import authRoutes from "./routes/auth.routes";

/**
 * Merges Dashboard & API routes into the main monolithic Express app.
 * This resolves the "No open ports detected" issue on Render by using a single PORT.
 */
export const setupDashboard = (app: express.Application, client: R3NDERClient) => {
    // Session with Shared Database (MUST be before routes)
    app.use(cookieParser());
    app.use(session({
        secret: process.env.SESSION_SECRET || "r3nder-secret",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
        cookie: { 
            maxAge: 60000 * 60 * 24 * 7, // 1 week
            secure: process.env.NODE_ENV === "production", // Secure in production
            sameSite: "lax"
        }
    }));

    const isAuth = (req: any, res: any, next: any) => {
        if ((req.session as any).user) return next();
        res.status(401).json({ message: "Unauthorized" });
    };

    // ─── AUTH ROUTES ───────────────────────────────────────────────────
    app.use("/", authRoutes);

    app.get("/api/user", isAuth, (req: any, res) => {
        const adminIds = (process.env.ADMIN_IDS || "").split(",");
        const user = (req.session as any).user;
        const isAdmin = user && adminIds.includes(user.id);
        res.json({ ...user, isAdmin, clientId: process.env.CLIENT_ID });
    });

    // ─── GUILD MANAGEMENT ─────────────────────────────────────────────
    app.get("/api/guilds", isAuth, async (req: any, res) => {
        try {
            const user = (req.session as any).user;
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
            } else {
                finalGuilds = userGuilds
                    .filter((g: any) => {
                        const perms = BigInt(g.permissions);
                        return (perms & BigInt(0x8)) === BigInt(0x8) || (perms & BigInt(0x20)) === BigInt(0x20);
                    })
                    .map((g: any) => ({
                        id: g.id,
                        name: g.name,
                        icon: g.icon,
                        botInstalled: client.guilds.cache.has(g.id)
                    }));
            }

            res.json({ guilds: finalGuilds });
        } catch (error) {
            res.status(500).json({ error: "Failed to sync nexus state" });
        }
    });

    app.get("/api/guild/:id/settings", isAuth, async (req, res) => {
        try {
            let guild = await Guild.findOne({ guildId: req.params.id });
            if (!guild) {
                guild = await new Guild({ guildId: req.params.id }).save();
            }
            res.json(guild);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch nexus settings" });
        }
    });

    app.post("/api/guild/:id/settings", isAuth, async (req, res) => {
        try {
            const { id } = req.params;
            const newSettings = req.body;
            
            const guild = client.guilds.cache.get(id);
            if (guild && newSettings.nickname) {
                const botMember = await guild.members.fetch(client.user!.id);
                if (botMember && botMember.nickname !== newSettings.nickname) {
                    await botMember.setNickname(newSettings.nickname).catch(() => {});
                }
            }

            await Guild.findOneAndUpdate({ guildId: id }, newSettings, { upsert: true });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: "Nexus Sync Failure" });
        }
    });

    app.post("/api/guild/:id/command", isAuth, async (req, res) => {
        const { command, data } = req.body;
        const guild = client.guilds.cache.get(req.params.id);

        if (!guild) return res.status(404).json({ error: "Nexus not reachable by shared bot instance" });

        try {
            switch (command) {
                case "CHANGE_NICKNAME":
                    await guild.members.me?.setNickname(data.nickname);
                    res.json({ success: true });
                    break;
                case "SET_REMINDER":
                    const channel = guild.channels.cache.get(data.channelId) as any;
                    if (channel?.send) {
                        setTimeout(() => {
                            channel.send(`⏰ **R3NDER REMINDER:** ${data.message}`);
                        }, data.delayMinutes * 60000);
                        res.json({ success: true });
                    } else {
                        res.status(400).json({ error: "Target channel invalid" });
                    }
                    break;
                default:
                    res.status(400).json({ error: "Unknown orchestration command" });
            }
        } catch (error) {
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
        } catch (error) {
            res.status(500).json({ error: "Telemetry Sync Failure" });
        }
    });

    app.get("/api/admin/stats", isAuth, async (req, res) => {
        const adminIds = (process.env.ADMIN_IDS || "").split(",");
        if (!adminIds.includes((req.session as any).user.id)) return res.status(403).json({ error: "Access Denied" });

        res.json({
            nexusCount: client.guilds.cache.size,
            userCount: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
            uptime: Math.floor(client.uptime! / 3600000) + "h",
            latency: client.ws.ping + "ms",
            status: "OPERATIONAL"
        });
    });

    console.log("✅ Dashboard & API Orchestrator initialized on primary port");
};

import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import MongoStore from "connect-mongo";
import cors from "cors";
import cookieParser from "cookie-parser";

import dotenv from "dotenv";
import path from "path";
import { R3NDERClient } from "@client/R3nderClient";
import { Guild } from "@database/Guild";
import { User } from "@database/User";
import { LogType, LogPriority } from "@database/Log";

export const startDashboard = (client: R3NDERClient) => {
    dotenv.config({ path: path.join(__dirname, "../.env") });

    const app = express();
    const port = process.env.PORT || 3001;
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";


// CORS - Essential for React Dashboard
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "https://r3nder-x18m.vercel.app"],
    credentials: true
}));



app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
    res.send("R3NDER OK");
});


// Session with Shared Database
app.use(session({
    secret: process.env.SESSION_SECRET || "r3nder-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 60000 * 60 * 24 * 7 }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new DiscordStrategy({
    clientID: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    callbackURL: process.env.CALLBACK_URL!,
    scope: ["identify", "guilds", "email"]
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

const isAuth = (req: any, res: any, next: any) => {
    if (req.user) return next();
    res.status(401).json({ message: "Unauthorized" });
};

// ─── AUTH ROUTES ───────────────────────────────────────────────────
app.get("/auth/discord", passport.authenticate("discord"));
app.get("/auth/callback", passport.authenticate("discord", {

    failureRedirect: FRONTEND_URL
}), (req: any, res) => {
    const adminIds = (process.env.ADMIN_IDS || "").split(",");
    const isAdmin = adminIds.includes(req.user.id);
    res.redirect(isAdmin ? `${FRONTEND_URL}/core/overview` : `${FRONTEND_URL}/portal`);
});

app.get("/api/user", isAuth, (req: any, res) => {
    const adminIds = (process.env.ADMIN_IDS || "").split(",");
    const isAdmin = adminIds.includes(req.user.id);
    res.json({ ...req.user, isAdmin, clientId: process.env.CLIENT_ID });
});

// ─── CORE PRESENCE LOGIC (THE USER'S GOAL) ─────────────────────────
app.get("/api/guilds", isAuth, async (req: any, res) => {
    try {
        const userGuilds = req.user.guilds || [];
        const adminIds = (process.env.ADMIN_IDS || "").split(",");
        const isAdmin = adminIds.includes(req.user.id);

        let finalGuilds = [];

        // MASTER OVERRIDE: IF ADMIN, SHOW ALL BOT SERVERS DIRECTLY FROM MEMORY
        if (isAdmin) {
            finalGuilds = client.guilds.cache.map(g => ({
                id: g.id,
                name: g.name,
                icon: g.icon,
                botInstalled: true
            }));
        } else {
            // INCLUSIVE BITWISE AUDIT FOR STANDARD USERS
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

// ─── SETTINGS & COMMANDS (THE USER'S DASHBOARD GOAL) ───────────────
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
        
        // ORCHESTRATE REAL-TIME IDENTITY SYNC
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
                if (data.nickname !== undefined) {
                    await guild.members.me?.setNickname(data.nickname);
                    res.json({ success: true });
                } else {
                    res.status(400).json({ error: "New identity string not provided" });
                }
                break;

            case "SET_REMINDER":
                // HIGH-FIDELITY PULSE: SCHEDULING DISPATCH
                const channel = guild.channels.cache.get(data.channelId) as any;
                if (channel && channel.send) {
                    setTimeout(() => {
                        channel.send(`⏰ **R3NDER REMINDER:** ${data.message}`);
                    }, data.delayMinutes * 60000);
                    res.json({ success: true });
                } else {
                    res.status(400).json({ error: "Target channel ID invalid or unreachable" });
                }
                break;

            default:
                res.status(400).json({ error: "Unknown orchestration command" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Command execution failure" });
    }
});

app.get("/api/guild/:id/music", isAuth, async (req, res) => {

    const status = client.music.getStatus(req.params.id);
    res.json(status || { playing: false });
});

app.get("/api/stats", async (req, res) => {
    try {
        const totalServers = client.guilds.cache.size;
        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        // SAMPLE PULSE: CALCULATE COMMANDS FROM VOID OR LOGS
        const commandsProcessed = 15243; 

        res.json({
            totalServers,
            totalUsers,
            commandsProcessed,
            uptime: client.uptime
        });
    } catch (error) {
        res.status(500).json({ error: "Telemetry Sync Failure" });
    }
});

app.get("/api/admin/stats", isAuth, async (req, res) => {
    const adminIds = (process.env.ADMIN_IDS || "").split(",");
    if (!adminIds.includes((req.user as any).id)) return res.status(403).json({ error: "Access Denied" });

    const nexusCount = client.guilds.cache.size;
    const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    const uptime = Math.floor(client.uptime! / 3600000) + "h " + Math.floor((client.uptime! % 3600000) / 60000) + "m";
    
    res.json({
        nexusCount,
        userCount,
        uptime,
        status: "OPERATIONAL",
        latency: client.ws.ping + "ms",
        aiInteractions: 124580 // Mock current interaction count until DB sync
    });
});

app.get("/api/admin/logs", isAuth, async (req, res) => {

    const adminIds = (process.env.ADMIN_IDS || "").split(",");
    if (!adminIds.includes((req.user as any).id)) return res.status(403).json({ error: "Access Denied" });

    // SAMPLE PULSE DATA FOR INITIAL ORCHESTRATION
    const samples = [
        { type: "AI", content: "Orchestrated personality sync for Nexus 1243...", guildName: "R3NDER HOME", userName: "Adhil", createdAt: new Date() },
        { type: "COMMAND", content: "Bot identity change executed: R3NDER Core", guildName: "R3NDER HOME", userName: "Adhil", createdAt: new Date(Date.now() - 50000) },
        { type: "SYSTEM", content: "Hot-Restart performed: Global Pulse Online", guildName: "N/A", userName: "SYSTEM", createdAt: new Date(Date.now() - 100000) }
    ];
    res.json(samples);
});

// MONOLITHIC FINALITY: Serving Dashboard Assets Directly
app.use(express.static(path.join(__dirname, "../dashboard/client/dist")));

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../dashboard/client/dist/index.html"));
});

    app.listen(port, () => {

        console.log(`[R3NDER Monolith] Dashboard Server running on port ${port}`);
        console.log(`[R3NDER Monolith] Shared Bot Instance Ready: ${client.user?.tag || "Initializing..."}`);
    });
};



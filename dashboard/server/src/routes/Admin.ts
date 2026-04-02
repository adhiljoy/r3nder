import express from "express";
import axios from "axios";
import os from "os";
import pkg from "../../../package.json";
import { Log, LogType } from "../../shared/models/Log";
import { Guild } from "../../shared/models/Guild";
import { User } from "../../shared/models/User";
import { Analytics } from "../../shared/models/Analytics";

const router = express.Router();
const BOT_API_URL = "http://localhost:3002";

// Middleware to check Admin permission
const checkAdmin = (req: any, res: any, next: any) => {
    const adminIds = (process.env.ADMIN_IDS || "").split(",");
    if (req.user && adminIds.includes(req.user.id)) {
        return next();
    }
    res.status(403).json({ message: "Admin access denied" });
};

router.use(checkAdmin);

/**
 * @route   GET /api/admin/system/pulse
 * @desc    High-fidelity system health monitoring (CPU, RAM, Uptime)
 */
router.get("/system/pulse", async (req, res) => {
    try {
        const uptime = process.uptime();
        const mem = process.memoryUsage();
        const load = os.loadavg();
        
        let botStatus = "OFFLINE";
        let botMetrics = null;
        
        try {
            const response = await axios.get(`${BOT_API_URL}/music/metrics`, { timeout: 2000 });
            botStatus = "ONLINE";
            botMetrics = response.data;
        } catch (e) {}

        res.json({
            status: "OPERATIONAL",
            version: pkg.version,
            uptime: {
                dashboard: Math.floor(uptime),
                os: Math.floor(os.uptime())
            },
            resources: {
                cpu: {
                    load: load[0].toFixed(2),
                    cores: os.cpus().length,
                    model: os.cpus()[0].model
                },
                memory: {
                    rss: (mem.rss / 1024 / 1024).toFixed(2) + " MB",
                    heapUsed: (mem.heapUsed / 1024 / 1024).toFixed(2) + " MB",
                    total: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + " GB"
                }
            },
            bot: {
                status: botStatus,
                url: BOT_API_URL,
                metrics: botMetrics
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Heatbeat failure" });
    }
});

/**
 * @route   GET /api/admin/analytics/overview
 * @desc    Executive analytics summary (Growth, Interaction, Retention)
 */
router.get("/analytics/overview", async (req, res) => {
    try {
        const totalLogs = await Log.countDocuments();
        const totalGuilds = await Guild.countDocuments();
        const totalUsers = await User.countDocuments();
        
        const commandsByType = await Log.aggregate([
            { $match: { type: LogType.COMMAND } },
            { $group: { _id: "$action", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const topGuilds = await Log.aggregate([
            { $group: { _id: "$guildId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            counters: {
                logs: totalLogs,
                guilds: totalGuilds,
                users: totalUsers
            },
            distribution: {
                commands: commandsByType.map(c => ({ name: c._id, count: c.count })),
                topGuilds
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Analytics processing failure" });
    }
});

/**
 * @route   GET /api/admin/guilds
 * @desc    Direct guild management and oversight
 */
router.get("/guilds", async (req, res) => {
    try {
        const guilds = await Guild.find().sort({ lastAction: -1 }).limit(100);
        res.json(guilds);
    } catch (error) {
        res.status(500).json({ message: "Guild indexing failure" });
    }
});

/**
 * @route   POST /api/admin/guild/:id/leave
 * @desc    Force the bot to exit a server
 */
router.post("/guild/:id/leave", async (req, res) => {
    try {
        await axios.post(`${BOT_API_URL}/guild/${req.params.id}/leave`);
        res.json({ success: true, message: `Terminated connection with guild ${req.params.id}` });
    } catch (error) {
        res.status(500).json({ message: "Force-quit request failed" });
    }
});

export default router;

import express from "express";
import axios from "axios";
import os from "os";

// Bit-perfect Meta Hardcoding
const pkg = { version: "1.0.0" };
import { Log, LogType } from "@database/Log";
import { Guild } from "@database/Guild";
import { User } from "@database/User";
import { Analytics } from "@database/Analytics";

const router = express.Router();
const BOT_API_URL = "http://localhost:3002";

// router.use(checkAdmin) is removed as it's handled in server.ts


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
            totalLogs,
            totalGuilds,
            totalUsers,
            statsByType: commandsByType.map((c: any) => ({ _id: c._id, count: c.count })),
            topGuilds
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
/**
 * @route   GET /api/admin/logs
 * @desc    Paginated forensic log explorer
 */
router.get("/logs", async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = 50;
        const skip = (page - 1) * limit;

        const { search, type, guildId } = req.query;
        let query: any = {};

        if (type) query.type = type;
        if (guildId) query.guildId = guildId;
        if (search) {
            query.$or = [
                { content: { $regex: search, $options: "i" } },
                { action: { $regex: search, $options: "i" } }
            ];
        }

        const logs = await Log.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Log.countDocuments(query);

        res.json({
            logs,
            total,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: "Log retrieval failure" });
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

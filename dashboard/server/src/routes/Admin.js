"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const os_1 = __importDefault(require("os"));
// Bit-perfect Meta Hardcoding
const pkg = { version: "1.0.0" };
const Log_1 = require("@database/Log");
const Guild_1 = require("@database/Guild");
const User_1 = require("@database/User");
const router = express_1.default.Router();
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
        const load = os_1.default.loadavg();
        let botStatus = "OFFLINE";
        let botMetrics = null;
        try {
            const response = await axios_1.default.get(`${BOT_API_URL}/music/metrics`, { timeout: 2000 });
            botStatus = "ONLINE";
            botMetrics = response.data;
        }
        catch (e) { }
        res.json({
            status: "OPERATIONAL",
            version: pkg.version,
            uptime: {
                dashboard: Math.floor(uptime),
                os: Math.floor(os_1.default.uptime())
            },
            resources: {
                cpu: {
                    load: load[0].toFixed(2),
                    cores: os_1.default.cpus().length,
                    model: os_1.default.cpus()[0].model
                },
                memory: {
                    rss: (mem.rss / 1024 / 1024).toFixed(2) + " MB",
                    heapUsed: (mem.heapUsed / 1024 / 1024).toFixed(2) + " MB",
                    total: (os_1.default.totalmem() / 1024 / 1024 / 1024).toFixed(2) + " GB"
                }
            },
            bot: {
                status: botStatus,
                url: BOT_API_URL,
                metrics: botMetrics
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: "Heatbeat failure" });
    }
});
/**
 * @route   GET /api/admin/analytics/overview
 * @desc    Executive analytics summary (Growth, Interaction, Retention)
 */
router.get("/analytics/overview", async (req, res) => {
    try {
        const totalLogs = await Log_1.Log.countDocuments();
        const totalGuilds = await Guild_1.Guild.countDocuments();
        const totalUsers = await User_1.User.countDocuments();
        const commandsByType = await Log_1.Log.aggregate([
            { $match: { type: Log_1.LogType.COMMAND } },
            { $group: { _id: "$action", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        const topGuilds = await Log_1.Log.aggregate([
            { $group: { _id: "$guildId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        res.json({
            totalLogs,
            totalGuilds,
            totalUsers,
            statsByType: commandsByType.map((c) => ({ _id: c._id, count: c.count })),
            topGuilds
        });
    }
    catch (error) {
        res.status(500).json({ message: "Analytics processing failure" });
    }
});
/**
 * @route   GET /api/admin/guilds
 * @desc    Direct guild management and oversight
 */
router.get("/guilds", async (req, res) => {
    try {
        const guilds = await Guild_1.Guild.find().sort({ lastAction: -1 }).limit(100);
        res.json(guilds);
    }
    catch (error) {
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
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        const skip = (page - 1) * limit;
        const { search, type, guildId } = req.query;
        let query = {};
        if (type)
            query.type = type;
        if (guildId)
            query.guildId = guildId;
        if (search) {
            query.$or = [
                { content: { $regex: search, $options: "i" } },
                { action: { $regex: search, $options: "i" } }
            ];
        }
        const logs = await Log_1.Log.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);
        const total = await Log_1.Log.countDocuments(query);
        res.json({
            logs,
            total,
            pages: Math.ceil(total / limit)
        });
    }
    catch (error) {
        res.status(500).json({ message: "Log retrieval failure" });
    }
});
/**
 * @route   POST /api/admin/guild/:id/leave
 * @desc    Force the bot to exit a server
 */
router.post("/guild/:id/leave", async (req, res) => {
    try {
        await axios_1.default.post(`${BOT_API_URL}/guild/${req.params.id}/leave`);
        res.json({ success: true, message: `Terminated connection with guild ${req.params.id}` });
    }
    catch (error) {
        res.status(500).json({ message: "Force-quit request failed" });
    }
});
exports.default = router;

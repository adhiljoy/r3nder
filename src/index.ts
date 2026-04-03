import * as dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GatewayIntentBits, Partials } from "discord.js";
import { R3NDERClient } from "./client/R3nderClient";
import { setupDashboard } from "./DashboardServer";

dotenv.config();

/**
 * 🚀 R3NDER MONOLITHIC DEPLOYMENT (RENDER OPTIMIZED)
 * Combines Express API + Discord Bot + Dashboard Support
 */

const app = express();
const PORT = Number(process.env.PORT) || 10000;

// ✅ EXPRESS MIDDLEWARE
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));

// ✅ HEALTH & STATUS ENDPOINTS
app.get("/", (req, res) => {
    res.send("🚀 R3NDER Backend Live (Port Bound & Ready)");
});

app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date(), bot: client.isReady() });
});

// ✅ INITIALIZE DISCORD CLIENT
export const client = new R3NDERClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember],
});

/**
 * 🏁 BOOTSTRAP: PARALLEL EXECUTION ARCHITECTURE
 * Render requires immediate HTTP server binding.
 */

// 1. Setup API / Dashboard Routes
setupDashboard(app, client);

// 2. Start HTTP Server (Key Fix for "No open ports detected")
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🔥 SERVER RUNNING ON PORT ${PORT}`);
    
    // 3. Start Discord Bot in Background
    client.initialize().then(() => {
        console.log(`🤖 Bot logged in as ${client.user?.tag || "Unknown"}`);
    }).catch((error) => {
        console.error("❌ Bot Initialization Error:", error);
    });
});

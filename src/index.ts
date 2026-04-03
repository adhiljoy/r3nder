import * as dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GatewayIntentBits, Partials } from "discord.js";
import { R3NDERClient } from "./client/R3nderClient";
import { startDashboard } from "./DashboardServer";

dotenv.config();

const app = express();

// ✅ IMPORTANT: Render port
const PORT = Number(process.env.PORT) || 10000;

// ✅ Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));

// ✅ ROOT ROUTE (fixes "Cannot GET /")
app.get("/", (req, res) => {
  res.send("🚀 R3NDER Backend Live");
});

// ✅ HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

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

client.initialize().then(() => {
    console.log("[R3NDER] Bot Heartbeat online.");
    
    // Identity Pulse Check
    const token = process.env.TOKEN || process.env.DISCORD_TOKEN;
    if (!token) {
        console.error("❌ CRITICAL: No Identity Coordinate detected (TOKEN or DISCORD_TOKEN is missing)");
    }

    // START SERVER (THIS IS THE KEY FIX)
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`🔥 Server running on port ${PORT}`);
        startDashboard(client); // Initializing dashboard monolith
    });
}).catch((error: Error) => {
    console.error("[Index Error] Failed to initialize R3NDER:", error);
});

import * as dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import { GatewayIntentBits, Partials } from "discord.js";
import { R3NDERClient } from "./client/R3nderClient";
import { startDashboard } from "./DashboardServer";

const app = express();
const PORT = process.env.PORT || 3000;

// Render Production Heartbeat
app.get("/", (req, res) => {
    res.send("🚀 R3NDER Backend is LIVE");
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

    // Launching the Port-Aware Pulse
    app.listen(PORT, () => {
        console.log(`[R3NDER] Port-Aware Pulse running on port ${PORT}`);
        startDashboard(client); // Initializing dashboard monolith
    });
}).catch((error: Error) => {
    console.error("[Index Error] Failed to initialize R3NDER:", error);
});

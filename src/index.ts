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

// ================== PARALLEL EXECUTION ==================

// 1. Start Server IMMEDIATELY (Render requires this)
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🔥 SERVER RUNNING ON PORT ${PORT}`);
    
    // 2. Initialize Bot in background
    client.initialize().then(() => {
        console.log("🤖 R3NDER Bot logged in and ready");
        
        // 3. Initialize Dashboard server (Shares backend state)
        startDashboard(client); 
    }).catch((error) => {
        console.error("❌ Bot Initialization Error:", error);
    });
});

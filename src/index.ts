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
 * 🚀 R3NDER PRODUCTION SERVER (MONOLITH)
 * Combined Discord Bot + Backend API + Dashboard State
 */

const app = express();
const PORT = Number(process.env.PORT) || 10000;

// ✅ MIDDLEWARE CONFIGURATION
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));

// ✅ BOT BRAIN INITIALIZATION
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

// ✅ ROOT STATUS ROUTES
app.get("/", (req, res) => {
    res.send("🚀 R3NDER Backend Live (API & API Gateway)");
});

app.get("/health", (req, res) => {
    res.json({ 
        status: "ok", 
        timestamp: new Date().toISOString(), 
        botReady: client.isReady(),
        ping: client.ws.ping
    });
});

/**
 * ───────────────────────────────────────
 * 🏁 BOOTSTRAP: PARALLEL EXECUTION ARCHITECTURE
 * ───────────────────────────────────────
 */

// 1. Setup Dashboard / API Routes BEFORE Listening
setupDashboard(app, client);

// 2. Start HTTP Server IMMEDIATELY (Render Requirement)
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🔥 SERVER RUNNING ON PORT ${PORT}`);
    
    // 3. Initialize Discord Bot in Background
    client.initialize().then(() => {
        console.log(`🤖 R3NDER Bot logged in as ${client.user?.tag}`);
    }).catch((error) => {
        console.error("❌ CRITICAL: Bot Execution Failure during initialization.", error);
    });
});

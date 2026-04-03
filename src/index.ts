import express from "express";
import { Client, GatewayIntentBits } from "discord.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ✅ PORT FIX (IMPORTANT FOR RENDER)
const PORT = Number(process.env.PORT) || 10000;

// ✅ HEALTH ROUTES
app.get("/", (req, res) => {
  res.send("🔥 R3NDER Backend Live");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ✅ DISCORD BOT
const bot = new Client({
  intents: [GatewayIntentBits.Guilds]
});

bot.once("ready", () => {
    if (bot.user) {
        console.log(`🤖 Bot ready: ${bot.user.tag}`);
    }
});

// ✅ LOGIN BOT
if (process.env.DISCORD_TOKEN) {
    bot.login(process.env.DISCORD_TOKEN).catch(err => console.error("❌ Login error:", err));
} else {
    console.error("❌ DISCORD_TOKEN is missing from environment variables.");
}

// ✅ MONGODB
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
      .then(() => console.log("✅ MongoDB connected"))
      .catch(err => console.error("❌ Mongo error:", err));
} else {
    console.error("❌ MONGO_URI is missing from environment variables.");
}

// ✅ START SERVER
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

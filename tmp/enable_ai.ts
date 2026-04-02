import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { Guild } from "../dashboard/shared/models/Guild";

dotenv.config({ path: path.join(__dirname, "../.env") });

const GUILD_ID = "1243617527737745508";

async function enableAI() {
    try {
        console.log("Connecting to R3NDER Core Database...");
        await mongoose.connect(process.env.MONGO_URI!);
        
        console.log(`Searching for Nexus: ${GUILD_ID}...`);
        let guild = await Guild.findOne({ guildId: GUILD_ID });
        
        if (!guild) {
            console.log("Nexus not found in registry. Creating new entry...");
            guild = new Guild({ guildId: GUILD_ID });
        }

        console.log("Executing AI System Empowerment...");
        guild.aiAutopilot.enabled = true;
        guild.aiAutopilot.autoReply = true;
        guild.aiAutopilot.mentionResponse = true;
        guild.aiAutopilot.personality = "coder"; // Setting a nice personality for the test
        
        await guild.save();
        
        console.log("✅ AI System Successfully Empowered!");
        console.log("System Status: OPERATIONAL [ONLINE]");
    } catch (error) {
        console.error("❌ ERROR: Failed to reach the R3NDER Nexus:", error);
    } finally {
        await mongoose.disconnect();
    }
}

enableAI();

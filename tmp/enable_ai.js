"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const Guild_1 = require("../dashboard/shared/models/Guild");
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../.env") });
const GUILD_ID = "1243617527737745508";
async function enableAI() {
    try {
        console.log("Connecting to R3NDER Core Database...");
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log(`Searching for Nexus: ${GUILD_ID}...`);
        let guild = await Guild_1.Guild.findOne({ guildId: GUILD_ID });
        if (!guild) {
            console.log("Nexus not found in registry. Creating new entry...");
            guild = new Guild_1.Guild({ guildId: GUILD_ID });
        }
        console.log("Executing AI System Empowerment...");
        guild.aiAutopilot.enabled = true;
        guild.aiAutopilot.autoReply = true;
        guild.aiAutopilot.mentionResponse = true;
        guild.aiAutopilot.personality = "coder"; // Setting a nice personality for the test
        await guild.save();
        console.log("✅ AI System Successfully Empowered!");
        console.log("System Status: OPERATIONAL [ONLINE]");
    }
    catch (error) {
        console.error("❌ ERROR: Failed to reach the R3NDER Nexus:", error);
    }
    finally {
        await mongoose_1.default.disconnect();
    }
}
enableAI();

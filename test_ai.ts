import { AIService } from "./src/services/AIService";
import { DatabaseService } from "./src/services/DatabaseService";
import * as dotenv from "dotenv";
import * as path from "path";

// Load ENV
dotenv.config();

async function runTest() {
    console.log("🧪 Starting AI Service Test...");
    
    // 1. Connect to DB (Required for User/Guild lookups)
    const db = new DatabaseService();
    try {
        await db.connect();
        console.log("✅ Database Connected.");
    } catch (err) {
        console.error("❌ DB Connection Failed:", err);
        process.exit(1);
    }

    // 2. Initialize AI Service
    const ai = new AIService();
    
    const testUserId = "123456789";
    const testGuildId = "987654321";
    const testChannelId = "555555555";
    const testPrompt = "Hello R3NDER! Tell me a very short joke about coding.";

    console.log(`🤖 Sending Prompt: "${testPrompt}"`);

    try {
        const response = await ai.chat(testUserId, testGuildId, testChannelId, testPrompt);
        console.log("\n--- AI RESPONSE ---");
        console.log(response);
        console.log("-------------------\n");
        console.log("✅ AI Service Test COMPLETED.");
    } catch (error) {
        console.error("❌ AI Service Test FAILED.");
        console.error(error);
    } finally {
        process.exit(0);
    }
}

runTest();

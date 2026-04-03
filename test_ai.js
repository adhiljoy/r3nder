"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const AIService_1 = require("./src/services/AIService");
const DatabaseService_1 = require("./src/services/DatabaseService");
const dotenv = __importStar(require("dotenv"));
// Load ENV
dotenv.config();
async function runTest() {
    console.log("🧪 Starting AI Service Test...");
    // 1. Connect to DB (Required for User/Guild lookups)
    const db = new DatabaseService_1.DatabaseService();
    try {
        await db.connect();
        console.log("✅ Database Connected.");
    }
    catch (err) {
        console.error("❌ DB Connection Failed:", err);
        process.exit(1);
    }
    // 2. Initialize AI Service
    const ai = new AIService_1.AIService();
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
    }
    catch (error) {
        console.error("❌ AI Service Test FAILED.");
        console.error(error);
    }
    finally {
        process.exit(0);
    }
}
runTest();

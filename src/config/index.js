"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../../.env") });
exports.config = {
    TOKEN: process.env.TOKEN || "",
    MONGO_URI: process.env.MONGO_URI || "",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    GROQ_API_KEY: process.env.GROQ_API_KEY || "",
    CLIENT_ID: process.env.CLIENT_ID || "",
    GUILD_ID: process.env.GUILD_ID || "",
    AI_MEMORY_LIMIT: 15,
    ACR_HOST: process.env.ACR_HOST || "",
    ACR_ACCESS_KEY: process.env.ACR_ACCESS_KEY || "",
    ACR_SECRET_KEY: process.env.ACR_SECRET_KEY || "",
};
// Simple validation
const requiredVars = ["TOKEN", "MONGO_URI", "GROQ_API_KEY", "CLIENT_ID"];
for (const v of requiredVars) {
    if (!process.env[v]) {
        console.warn(`[CONFIG WARNING] Missing required environment variable: ${v}`);
    }
}

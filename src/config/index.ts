import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

export const config = {
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

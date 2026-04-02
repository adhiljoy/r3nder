import OpenAI from "openai";
import { config } from "../config/index";
import { AIContext } from "../database/shared/AIContext";
import { User } from "../database/shared/User";
import { Guild } from "../database/shared/Guild";
import { LogPriority, LogType } from "../database/shared/Log";

export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

export class AIService {
    private client: OpenAI;

    constructor() {
        if (!config.GROQ_API_KEY) {
            console.error("❌ CRITICAL: GROQ_API_KEY is missing from environment.");
        }
        this.client = new OpenAI({
            apiKey: config.GROQ_API_KEY,
            baseURL: "https://api.groq.com/openai/v1",
        });
    }

    private _getPersonalityPrompt(personality: string, nickname?: string): string {
        const base = `You are R3NDER, a smart Discord AI assistant. ${nickname ? `The user's nickname is "${nickname}".` : ""}`;
        
        switch (personality) {
            case "funny":
                return `${base} Your personality is witty, sarcastic, and hilarious. Use emojis and clever jokes.`;
            case "coder":
                return `${base} Your personality is a elite software engineer. You are technical, precise, and love talking about code and architecture.`;
            case "strict":
                return `${base} Your personality is a formal, strict, and highly professional administrative assistant. No jokes, just business.`;
            default:
                return `${base} Your tone is calm, professional yet slightly friendly (Siri-style). Keep responses concise.`;
        }
    }

    // ── Creator Identity Detection ─────────────────────────────────────────────
    private _getIdentityResponse(prompt: string): string | null {
        const q = prompt.toLowerCase().trim();

        const creatorTriggers = [
            "who created you", "who made you", "who built you", "who developed you",
            "who is your developer", "who is your creator", "who owns this bot",
            "who owns you", "who is your owner", "who made r3nder", "who created r3nder"
        ];

        const purposeTriggers = [
            "what are you for", "what is your purpose", "what can you do",
            "what do you do", "tell me about yourself", "what is r3nder",
            "what are your features", "what are your capabilities"
        ];

        const contactTriggers = [
            "how can i contact", "how do i contact", "contact info",
            "contact you", "email", "reach out", "support email", "get support"
        ];

        if (creatorTriggers.some(t => q.includes(t))) {
            return "I'm **R3NDER** — crafted by **Adhil Joy** to deliver premium AI-powered server management, automation, and music experiences on Discord. For inquiries or collaboration: `renderexe00@gmail.com`";
        }

        if (purposeTriggers.some(t => q.includes(t))) {
            return "I'm **R3NDER**, your all-in-one Discord intelligence engine. Here's what I bring to the table:\n\n🤖 **AI Chat** — Contextual conversations with memory\n🛡️ **Auto-Moderation** — Threat detection & member protection\n🎵 **Music System** — SoundCloud-first, multi-source playback\n📊 **Analytics Dashboard** — Real-time server insights\n\nBuilt by **Adhil Joy** · `renderexe00@gmail.com`";
        }

        if (contactTriggers.some(t => q.includes(t))) {
            return "For support, feedback, or business inquiries, reach the creator of R3NDER directly:\n\n👤 **Adhil Joy**\n📧 `renderexe00@gmail.com`";
        }

        return null;
    }

    public async chat(userId: string, guildId: string, channelId: string, prompt: string, nickname?: string): Promise<string> {
        if (!prompt || prompt.trim().length === 0) {
            return "Please provide a valid prompt.";
        }

        // ── Priority: Identity / Creator Questions ─────────────────────────────
        const identityResponse = this._getIdentityResponse(prompt);
        if (identityResponse) return identityResponse;

        try {
            // Fetch User and Guild data for Personality
            const userData = await User.findOne({ userId, guildId });
            const guildData = await Guild.findOne({ guildId });

            const tier = userData?.premiumTier || "free";
            const personality = guildData?.aiAutopilot?.personality || "normal";

            // Groq Free Model Assignment
            const model = "llama-3.1-8b-instant";
            let memoryLimit = 10;


            // Memory scaling (still using tiers for customization)
            if (tier === "pro") memoryLimit = 30;
            if (tier === "ultra") memoryLimit = 50;

            // Fetch chronological history
            const historyDocs = await AIContext.find({ userId, guildId })
                .sort({ createdAt: -1 })
                .limit(memoryLimit);
            
            const history: ChatMessage[] = historyDocs.map(doc => ({
                role: doc.role as any,
                content: doc.content
            })).reverse();

            const systemPrompt = this._getPersonalityPrompt(personality, nickname);

            const response = await this.client.chat.completions.create({
                model: model,
                messages: [
                    { role: "system", content: systemPrompt },
                    ...history,
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1024,
            });

            let reply = response.choices[0].message?.content || "No response generated by AI.";

            // Personalized greeting (randomized)
            if (nickname && Math.random() < 0.2 && !reply.includes(nickname)) {
                reply = `${nickname}, ${reply}`;
            }

            // Persist for memory
            await AIContext.create([
                { userId, guildId, channelId, role: "user", content: prompt },
                { userId, guildId, channelId, role: "assistant", content: reply }
            ]);

            return reply;
        } catch (error: any) {
            console.error("AI ERROR:", error);
            const errorMsg = error.response?.data?.error?.message || error.message || "Unknown AI Provider Error";
            return `AI is temporarily unavailable. (${errorMsg})`;
        }
    }

    public async checkToxicity(content: string): Promise<boolean> {
        // Groq does not have a dedicated moderation endpoint in the OpenAI SDK wrapper.
        // Returning false for now as a bypass.
        return false;
    }

    public async isPrompt(content: string): Promise<boolean> {
        const questionKeywords = ["how", "what", "why", "where", "who", "when", "?", "help", "can you", "render", "ren"];
        return questionKeywords.some(key => content.toLowerCase().includes(key));
    }

    public async clearMemory(userId: string, guildId: string): Promise<void> {
        await AIContext.deleteMany({ userId, guildId });
    }
}

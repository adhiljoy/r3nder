import { OpenAI } from "openai";
import { config } from "@config/index";

export class VisionService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: config.OPENAI_API_KEY,
        });
    }

    public async processImage(imageUrl: string, prompt: string): Promise<string> {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            { type: "image_url", image_url: { url: imageUrl } },
                        ],
                    },
                ],
            });

            return response.choices[0].message?.content || "No analysis generated.";
        } catch (error: unknown) {
            console.error("[VisionService Error]", error);
            throw new Error("Failed to process image with AI Vision.");
        }
    }

    public validateImage(size: number, type: string): void {
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

        if (size > MAX_SIZE) throw new Error("File size too large (Max 5MB).");
        if (!ALLOWED_TYPES.includes(type)) throw new Error("Invalid file type (JPG, PNG, WEBP, GIF only).");
    }
}

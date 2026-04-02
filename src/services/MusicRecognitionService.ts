import axios from "axios";
import FormData from "form-data";
import crypto from "crypto";
import { config } from "@config/index";

export interface RecognitionResult {
    title: string;
    artist: string;
    album: string;
}

export class MusicRecognitionService {
    private host = "identify-eu-west-1.acrcloud.com";
    private accessKey = process.env.ACR_KEY;
    private accessSecret = process.env.ACR_SECRET;

    public async identify(buffer: Buffer): Promise<RecognitionResult | null> {
        if (!this.accessKey || !this.accessSecret) {
            console.error("[MusicRecognitionService] Missing ACRCloud credentials.");
            return null;
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const method = "POST";
        const endpoint = "/v1/identify";
        const data_type = "audio";
        const signature_version = "1";

        const stringToSign = [
            method,
            endpoint,
            this.accessKey,
            data_type,
            signature_version,
            timestamp
        ].join("\n");

        const signature = crypto
            .createHmac("sha1", this.accessSecret)
            .update(Buffer.from(stringToSign, "utf-8"))
            .digest()
            .toString("base64");

        const form = new FormData();
        form.append("sample", buffer);
        form.append("access_key", this.accessKey);
        form.append("data_type", data_type);
        form.append("signature_version", signature_version);
        form.append("signature", signature);
        form.append("sample_bytes", buffer.length);
        form.append("timestamp", timestamp);

        try {
            const response = await axios.post(`https://${this.host}${endpoint}`, form, {
                headers: form.getHeaders(),
            });

            const result = response.data as any;
            if (result.status.code === 0 && result.metadata?.music?.[0]) {
                const music = result.metadata.music[0];
                return {
                    title: music.title,
                    artist: music.artists?.[0]?.name || "Unknown Artist",
                    album: music.album?.name || "Unknown Album",
                };
            }

            return null;
        } catch (error) {
            console.error("[MusicRecognitionService] Recognition Error:", error);
            return null;
        }
    }
}

import axios from "axios";
import crypto from "crypto";
import FormData from "form-data";
import { config } from "@config/index";

export interface RecognitionResult {
    status: {
        msg: string;
        code: number;
        version: string;
    };
    metadata?: {
        music?: Array<{
            title: string;
            artists: Array<{ name: string }>;
            album: { name: string };
            score: number;
            release_date?: string;
            label?: string;
            genres?: Array<{ name: string }>;
        }>;
    };
}

export class MusicRecognitionService {
    private readonly host: string;
    private readonly accessKey: string;
    private readonly accessSecret: string;

    constructor() {
        this.host = config.ACR_HOST;
        this.accessKey = config.ACR_ACCESS_KEY;
        this.accessSecret = config.ACR_SECRET_KEY;
    }

    /**
     * Identify music from an audio buffer
     * @param audioBuffer The audio buffer to identify
     * @returns Recognition results from ACRCloud
     */
    public async identify(audioBuffer: Buffer): Promise<RecognitionResult> {
        if (!this.accessKey || !this.accessSecret || !this.host) {
            throw new Error("ACRCloud credentials are not configured.");
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const method = "POST";
        const uri = "/v1/identify";
        const dataType = "audio";
        const signatureVersion = "1";

        const stringToSign = [
            method,
            uri,
            this.accessKey,
            dataType,
            signatureVersion,
            timestamp
        ].join("\n");

        const signature = crypto
            .createHmac("sha1", this.accessSecret)
            .update(Buffer.from(stringToSign, "utf-8"))
            .digest()
            .toString("base64");

        const form = new FormData();
        form.append("sample", audioBuffer);
        form.append("sample_bytes", audioBuffer.length);
        form.append("access_key", this.accessKey);
        form.append("data_type", dataType);
        form.append("signature_version", signatureVersion);
        form.append("signature", signature);
        form.append("timestamp", timestamp);

        const response = await axios.post<RecognitionResult>(
            `https://${this.host}${uri}`,
            form,
            {
                headers: form.getHeaders(),
                timeout: 10000
            }
        );

        return response.data;
    }
}

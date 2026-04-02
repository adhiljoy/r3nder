import express, { Request, Response } from "express";
import { R3NDERClient } from "@client/R3nderClient";

export class InternalApiService {
    private app = express();
    private client: R3NDERClient;
    private port = 3002;

    constructor(client: R3NDERClient) {
        this.client = client;
        this.app.use(express.json());
        this.setupRoutes();
    }

    private setupRoutes() {
        this.app.get("/music/:guildId", (req: Request, res: Response) => {
            const guildId = req.params.guildId as string;
            const queue = this.client.music.getQueue(guildId);
            
            if (!queue) {
                return res.json({ playing: false });
            }

            res.json({
                playing: true,
                paused: queue.paused,
                volume: queue.volume,
                track: {
                    title: queue.songs[0].name,
                    author: queue.songs[0].uploader.name,
                    duration: queue.songs[0].formattedDuration,
                    thumbnail: queue.songs[0].thumbnail,
                    url: queue.songs[0].url,
                    progress: queue.currentTime,
                    totalSeconds: queue.songs[0].duration
                },
                queue: queue.songs.slice(1, 6).map(s => ({
                    title: s.name,
                    duration: s.formattedDuration
                }))
            });
        });

        this.app.post("/music/:guildId/control", async (req: Request, res: Response) => {
            const guildId = req.params.guildId as string;
            const { action, value } = req.body;

            try {
                switch (action) {
                    case "pause":
                        this.client.music.pause(guildId);
                        break;
                    case "resume":
                        this.client.music.resume(guildId);
                        break;
                    case "skip":
                        await this.client.music.skip(guildId);
                        break;
                    case "stop":
                        await this.client.music.stop(guildId);
                        break;
                    case "volume":
                        this.client.music.setVolume(guildId, value);
                        break;
                    case "shuffle":
                        this.client.music.shuffle(guildId);
                        break;
                }
                res.json({ success: true });
            } catch (error: any) {
                res.status(400).json({ success: false, error: error.message });
            }
        });

        this.app.post("/log", async (req: Request, res: Response) => {
            try {
                await this.client.logs.log(req.body);
                res.json({ success: true });
            } catch (error: any) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.get("/risk/:guildId/:userId", async (req: Request, res: Response) => {
            const { guildId, userId } = req.params;
            try {
                const analysis = await this.client.risk.analyzeUser(userId as string, guildId as string);
                res.json(analysis);
            } catch (error: any) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }

    public start() {
        this.app.listen(this.port, () => {
            console.log(`[InternalAPI] Bot listener active on port ${this.port}`);
        });
    }
}

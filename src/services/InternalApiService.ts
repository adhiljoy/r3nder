import express, { Request, Response } from "express";
import { R3NDERClient } from "@client/R3nderClient";
import { VoiceBasedChannel } from "discord.js";

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
            const status = this.client.music.getStatus(guildId);
            
            if (!status) {
                return res.json({ playing: false });
            }
            
            const currentTrack = status.songs[0];

            res.json({
                playing: status.playing,
                paused: status.paused,
                volume: status.volume,
                track: {
                    title: currentTrack.name,
                    author: currentTrack.author,
                    duration: currentTrack.durationRaw,
                    thumbnail: currentTrack.thumbnail,
                    url: currentTrack.url,
                    progress: status.currentTime,
                    totalSeconds: currentTrack.durationSec,
                    requestedBy: currentTrack.requestedBy
                },
                queue: status.songs.slice(1, 6).map((s: any) => ({
                    title: s.name,
                    duration: s.durationRaw,
                    requestedBy: s.requestedBy
                })),
                metrics: status.metrics
            });
        });

        this.app.post("/music/:guildId/control", async (req: Request, res: Response) => {
            const guildId = req.params.guildId as string;
            const { action, value, channelId, userId } = req.body;

            try {
                switch (action) {
                    case "play":
                        if (!channelId) throw new Error("Missing channelId for play action");
                        const channel = await this.client.channels.fetch(channelId) as VoiceBasedChannel;
                        // Pass the channelId also as text channel for panel registration
                        await this.client.music.play(channel, value, userId || this.client.user?.id || "R3NDER", channelId);
                        break;
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

        this.app.get("/music/metrics", (req: Request, res: Response) => {
            res.json(this.client.music.getMetrics());
        });

        this.app.post("/guild/:guildId/leave", async (req: Request, res: Response) => {
            const guildId = req.params.guildId as string;
            const guild = this.client.guilds.cache.get(guildId);
            if (guild) {
                await guild.leave();
                res.json({ success: true });
            } else {
                res.status(404).json({ success: false, error: "Guild not found in cache" });
            }
        });

        this.app.get("/risk/:guildId/:userId", async (req: Request, res: Response) => {
            const guildId = req.params.guildId as string;
            const userId = req.params.userId as string;
            try {
                const analysis = await this.client.risk.analyzeUser(userId as string, guildId as string);
                res.json(analysis);
            } catch (error: any) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // ─── Direct Guild Commands (Dashboard-triggered) ───────────────────
        this.app.post("/guild/:guildId/command", async (req: Request, res: Response) => {
            const guildId = req.params.guildId as string;
            const { command, data } = req.body;
            const guild = this.client.guilds.cache.get(guildId);
            if (!guild) return res.status(404).json({ error: "Guild not in cache" });

            try {
                switch (command) {
                    case "CHANGE_NICKNAME": {
                        const { userId, nickname } = data;
                        const member = await guild.members.fetch(userId);
                        await member.setNickname(nickname);
                        break;
                    }
                    case "SET_REMINDER": {
                        const { channelId, message, delayMinutes } = data;
                        const channel = await guild.channels.fetch(channelId);
                        if (channel?.isTextBased()) {
                            setTimeout(() => {
                                (channel as any).send(`⏰ **Dashboard Reminder**: ${message}`);
                            }, delayMinutes * 60000);
                        }
                        break;
                    }
                    default:
                        throw new Error(`Command ${command} not recognized`);
                }
                res.json({ success: true });
            } catch (error: any) {
                res.status(400).json({ success: false, error: error.message });
            }
        });
        
        // ─── Bot Presence Verification ────────────────────────────────────
        this.app.post("/guilds/presence", (req: Request, res: Response) => {
            const { guildIds } = req.body;
            if (!Array.isArray(guildIds)) return res.status(400).json({ error: "Empty or invalid guildIds array" });
            
            const results: Record<string, boolean> = {};
            guildIds.forEach(id => {
                results[id] = this.client.guilds.cache.has(id);
            });
            res.json(results);
        });

        this.app.get("/guild/:guildId/presence", (req: Request, res: Response) => {
            const { guildId } = req.params;
            res.json({ present: this.client.guilds.cache.has(guildId as string) });
        });

    }



    public start() {
        this.app.listen(this.port, () => {
            console.log(`[InternalAPI] Bot listener active on port ${this.port}`);
        });
    }
}

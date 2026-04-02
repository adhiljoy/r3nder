import { Client, ClientOptions, Collection, REST, Routes } from "discord.js";
import * as fs from "fs";
import * as path from "path";
import { Command } from "@appTypes/index";
import { config } from "@config/index";
import { AIService } from "@services/AIService";
import { MusicService } from "@services/MusicService";
import { DatabaseService } from "@services/DatabaseService";
import { CacheService } from "@services/CacheService";
import { RateLimitService } from "@services/RateLimitService";
import { VisionService } from "@services/VisionService";
import { EconomyService } from "@services/EconomyService";
import { ShopService } from "@services/ShopService";
import { ModerationService } from "@services/ModerationService";
import { AutopilotService } from "@services/AutopilotService";
import { MusicRecognitionService } from "@services/MusicRecognitionService";
import { AnalyticsService } from "@services/AnalyticsService";
import { InternalApiService } from "@services/InternalApiService";
import { VoiceManager } from "@services/VoiceManager";

import { LogService } from "@services/LogService";
import { RiskService } from "@services/RiskService";

export class R3NDERClient extends Client {
    public commands: Collection<string, Command> = new Collection();
    public ai: AIService;
    public music: MusicService;
    public voiceManager: VoiceManager;
    public db: DatabaseService;
    public cache: CacheService;
    public ratelimit: RateLimitService;
    public vision: VisionService;
    public economy: EconomyService;
    public shop: ShopService;
    public moderation: ModerationService;
    public autopilot: AutopilotService;
    public musicRecognition: MusicRecognitionService;
    public analytics: AnalyticsService;
    public internalApi: InternalApiService;
    public logs: LogService;
    public risk: RiskService;

    constructor(options: ClientOptions) {
        super(options);
        this.db = new DatabaseService();
        this.ai = new AIService();
        this.voiceManager = new VoiceManager();
        this.music = new MusicService(this, this.voiceManager);
        this.cache = new CacheService();
        this.ratelimit = new RateLimitService();
        this.vision = new VisionService();
        this.economy = new EconomyService();
        this.shop = new ShopService();
        this.moderation = new ModerationService(this.ai);
        this.autopilot = new AutopilotService(this, this.ai);
        this.musicRecognition = new MusicRecognitionService();
        this.analytics = new AnalyticsService();
        this.internalApi = new InternalApiService(this);
        this.logs = new LogService(this);
        this.risk = new RiskService(this);
    }

    public async initialize(): Promise<void> {
        await this.db.connect();
        await this.loadEvents();
        await this.loadCommands();
        this.internalApi.start();
        await this.login(config.TOKEN);
    }

    public async loadCommands(): Promise<void> {
        const commandsPath = path.join(__dirname, "..", "commands");
        if (!fs.existsSync(commandsPath)) return;

        const slashCommands: any[] = [];
        const commandFolders = fs.readdirSync(commandsPath);

        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            if (!fs.statSync(folderPath).isDirectory()) continue;
            const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith(".ts") || f.endsWith(".js"));
            for (const file of commandFiles) {
                const command: Command = require(path.join(folderPath, file)).default;
                if (command && "data" in command && "execute" in command) {
                    this.commands.set(command.data.name, command);
                    slashCommands.push(command.data.toJSON());
                }
            }
        }

        const rest = new REST({ version: "10" }).setToken(config.TOKEN);
        try {
            console.log(`Refreshing ${slashCommands.length} slash commands...`);
            const data: any = await rest.put(Routes.applicationCommands(config.CLIENT_ID), { body: slashCommands });
            console.log(`Successfully reloaded ${data.length} commands.`);
        } catch (error: unknown) {
            console.error("[R3NDERClient] Load Commands Error:", error);
        }
    }

    public async loadEvents(): Promise<void> {
        const eventsPath = path.join(__dirname, "..", "events");
        if (!fs.existsSync(eventsPath)) return;
        const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".ts") || f.endsWith(".js"));
        for (const file of eventFiles) {
            const event = require(path.join(eventsPath, file)).default;
            if (event.once) {
                this.once(event.name as any, (...args: any[]) => event.execute(this, ...args));
            } else {
                this.on(event.name as any, (...args: any[]) => event.execute(this, ...args));
            }
        }
    }
}

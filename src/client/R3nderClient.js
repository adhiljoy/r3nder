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
exports.R3NDERClient = void 0;
const discord_js_1 = require("discord.js");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const index_1 = require("../config/index");
const AIService_1 = require("../services/AIService");
const MusicService_1 = require("../services/MusicService");
const DatabaseService_1 = require("../services/DatabaseService");
const CacheService_1 = require("../services/CacheService");
const RateLimitService_1 = require("../services/RateLimitService");
const VisionService_1 = require("../services/VisionService");
const EconomyService_1 = require("../services/EconomyService");
const ShopService_1 = require("../services/ShopService");
const ModerationService_1 = require("../services/ModerationService");
const AutopilotService_1 = require("../services/AutopilotService");
const MusicRecognitionService_1 = require("../services/MusicRecognitionService");
const AnalyticsService_1 = require("../services/AnalyticsService");
const InternalApiService_1 = require("../services/InternalApiService");
const VoiceManager_1 = require("../services/VoiceManager");
const MusicPanelService_1 = require("../services/MusicPanelService");
const LogService_1 = require("../services/LogService");
const RiskService_1 = require("../services/RiskService");
class R3NDERClient extends discord_js_1.Client {
    constructor(options) {
        super(options);
        this.commands = new discord_js_1.Collection();
        this.db = new DatabaseService_1.DatabaseService();
        this.ai = new AIService_1.AIService();
        this.voiceManager = new VoiceManager_1.VoiceManager();
        this.music = new MusicService_1.MusicService(this, this.voiceManager);
        this.cache = new CacheService_1.CacheService();
        this.ratelimit = new RateLimitService_1.RateLimitService();
        this.vision = new VisionService_1.VisionService();
        this.economy = new EconomyService_1.EconomyService();
        this.shop = new ShopService_1.ShopService();
        this.moderation = new ModerationService_1.ModerationService(this.ai);
        this.autopilot = new AutopilotService_1.AutopilotService(this, this.ai);
        this.musicRecognition = new MusicRecognitionService_1.MusicRecognitionService();
        this.analytics = new AnalyticsService_1.AnalyticsService();
        this.internalApi = new InternalApiService_1.InternalApiService(this);
        this.logs = new LogService_1.LogService(this);
        this.risk = new RiskService_1.RiskService(this);
        this.panel = new MusicPanelService_1.MusicPanelService(this);
    }
    async initialize() {
        await this.db.connect();
        await this.loadEvents();
        await this.loadCommands();
        this.internalApi.start();
        await this.login(index_1.config.TOKEN);
    }
    async loadCommands() {
        const commandsPath = path.join(__dirname, "..", "commands");
        if (!fs.existsSync(commandsPath))
            return;
        const slashCommands = [];
        const commandFolders = fs.readdirSync(commandsPath);
        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            if (!fs.statSync(folderPath).isDirectory())
                continue;
            const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith(".ts") || f.endsWith(".js"));
            for (const file of commandFiles) {
                const command = require(path.join(folderPath, file)).default;
                if (command && "data" in command && "execute" in command) {
                    this.commands.set(command.data.name, command);
                    slashCommands.push(command.data.toJSON());
                }
            }
        }
        const rest = new discord_js_1.REST({ version: "10" }).setToken(index_1.config.TOKEN);
        try {
            console.log(`Refreshing ${slashCommands.length} slash commands...`);
            const data = await rest.put(discord_js_1.Routes.applicationCommands(index_1.config.CLIENT_ID), { body: slashCommands });
            console.log(`Successfully reloaded ${data.length} commands.`);
        }
        catch (error) {
            console.error("[R3NDERClient] Load Commands Error:", error);
        }
    }
    async loadEvents() {
        const eventsPath = path.join(__dirname, "..", "events");
        if (!fs.existsSync(eventsPath))
            return;
        const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".ts") || f.endsWith(".js"));
        for (const file of eventFiles) {
            const event = require(path.join(eventsPath, file)).default;
            if (event.once) {
                this.once(event.name, (...args) => event.execute(this, ...args));
            }
            else {
                this.on(event.name, (...args) => event.execute(this, ...args));
            }
        }
    }
}
exports.R3NDERClient = R3NDERClient;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Guild_1 = require("../database/shared/Guild");
const Log_1 = require("../database/shared/Log");
exports.default = {
    name: discord_js_1.Events.GuildCreate,
    once: false,
    async execute(client, guild) {
        console.log(`[R3NDER Kernel] Joined New Nexus: ${guild.name} (${guild.id})`);
        // Register in Core Registry
        const exists = await Guild_1.Guild.findOne({ guildId: guild.id });
        if (!exists) {
            await Guild_1.Guild.create({ guildId: guild.id });
        }
        // Log the event
        await Log_1.Log.create({
            guildId: guild.id,
            type: Log_1.LogType.SYSTEM,
            priority: Log_1.LogPriority.INFO,
            action: "BOT_JOIN",
            content: `R3NDER has been initialized in ${guild.name}`,
            timestamp: new Date()
        });
    },
};

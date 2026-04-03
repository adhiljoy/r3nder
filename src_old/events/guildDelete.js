"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Guild_1 = require("../database/shared/Guild");
const Log_1 = require("../database/shared/Log");
exports.default = {
    name: discord_js_1.Events.GuildDelete,
    once: false,
    async execute(client, guild) {
        console.log(`[R3NDER Kernel] Terminated Nexus Connection: ${guild.name} (${guild.id})`);
        // Update Registry
        await Guild_1.Guild.deleteOne({ guildId: guild.id });
        // High priority log for server removal
        await Log_1.Log.create({
            guildId: guild.id,
            type: Log_1.LogType.SYSTEM,
            priority: Log_1.LogPriority.CRITICAL,
            action: "BOT_LEAVE",
            content: `R3NDER has been decommissioned from ${guild.name}`,
            timestamp: new Date()
        });
    },
};

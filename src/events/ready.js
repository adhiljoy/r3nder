"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const User_1 = require("../database/shared/User");
const Guild_1 = require("../database/shared/Guild");
exports.default = {
    name: discord_js_1.Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`🚀 R3NDER is Online | Serving ${client.guilds.cache.size} Servers`);
        // Sync Guilds with Database
        const guilds = client.guilds.cache.map(g => g.id);
        const existing = await Guild_1.Guild.find({ guildId: { $in: guilds } });
        const existingIds = new Set(existing.map(e => e.guildId));
        let synced = 0;
        for (const id of guilds) {
            if (!existingIds.has(id)) {
                await Guild_1.Guild.create({ guildId: id });
                synced++;
            }
        }
        if (synced > 0)
            console.log(`[Database-Bot] Synced ${synced} new guilds into the core registry.`);
        setInterval(async () => {
            const today = new Date();
            const users = await User_1.User.find({
                birthday: {
                    $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                    $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
                }
            });
            for (const user of users) {
                const guild = client.guilds.cache.get(user.guildId);
                const member = await guild?.members.fetch(user.userId).catch(() => null);
                if (guild && member) {
                    const channel = guild.systemChannel || guild.channels.cache.find(c => c.isTextBased());
                    if (channel && channel.isTextBased()) {
                        channel.send(`🎂 Happy Birthday <@${member.id}>! R3NDER wishes you an amazing day! ✨`)
                            .catch((err) => console.error("[Birthday] Failed to send wish:", err));
                    }
                }
            }
        }, 86400000);
    },
};

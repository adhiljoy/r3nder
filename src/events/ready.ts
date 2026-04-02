import { Events, TextChannel } from "discord.js";
import { R3NDERClient } from "../client/R3nderClient";
import { User } from "../database/shared/User";
import { Guild } from "../database/shared/Guild";


export default {
    name: Events.ClientReady,
    once: true,
    async execute(client: R3NDERClient): Promise<void> {
        console.log(`🚀 R3NDER is Online | Serving ${client.guilds.cache.size} Servers`);
        
        // Sync Guilds with Database
        const guilds = client.guilds.cache.map(g => g.id);
        const existing = await Guild.find({ guildId: { $in: guilds } });
        const existingIds = new Set(existing.map(e => e.guildId));

        let synced = 0;
        for (const id of guilds) {
            if (!existingIds.has(id)) {
                await Guild.create({ guildId: id });
                synced++;
            }
        }
        if (synced > 0) console.log(`[Database-Bot] Synced ${synced} new guilds into the core registry.`);



        setInterval(async () => {
            const today = new Date();
            const users = await User.find({
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
                        (channel as TextChannel).send(`🎂 Happy Birthday <@${member.id}>! R3NDER wishes you an amazing day! ✨`)
                            .catch((err: Error) => console.error("[Birthday] Failed to send wish:", err));
                    }
                }
            }
        }, 86400000);
    },
};

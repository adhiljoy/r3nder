import { Events, Guild as DiscordGuild } from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import { Guild } from "@database/Guild";
import { Log, LogType, LogPriority } from "@database/Log";

export default {
    name: Events.GuildCreate,
    once: false,
    async execute(client: R3NDERClient, guild: DiscordGuild): Promise<void> {
        console.log(`[R3NDER Kernel] Joined New Nexus: ${guild.name} (${guild.id})`);

        // Register in Core Registry
        const exists = await Guild.findOne({ guildId: guild.id });
        if (!exists) {
            await Guild.create({ guildId: guild.id });
        }

        // Log the event
        await Log.create({
            guildId: guild.id,
            type: LogType.SYSTEM,
            priority: LogPriority.INFO,
            action: "BOT_JOIN",
            content: `R3NDER has been initialized in ${guild.name}`,
            timestamp: new Date()
        });
    },
};

import { Events, Guild as DiscordGuild } from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import { Guild } from "@database/Guild";
import { Log, LogType, LogPriority } from "@database/Log";

export default {
    name: Events.GuildDelete,
    once: false,
    async execute(client: R3NDERClient, guild: DiscordGuild): Promise<void> {
        console.log(`[R3NDER Kernel] Terminated Nexus Connection: ${guild.name} (${guild.id})`);

        // Update Registry
        await Guild.deleteOne({ guildId: guild.id });

        // High priority log for server removal
        await Log.create({
            guildId: guild.id,
            type: LogType.SYSTEM,
            priority: LogPriority.CRITICAL,
            action: "BOT_LEAVE",
            content: `R3NDER has been decommissioned from ${guild.name}`,
            timestamp: new Date()
        });
    },
};

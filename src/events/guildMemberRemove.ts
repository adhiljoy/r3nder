import { Events, GuildMember } from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import { LogType, LogPriority } from "@database/Log";

export default {
    name: Events.GuildMemberRemove,
    async execute(client: R3NDERClient, member: GuildMember): Promise<void> {
        client.logs.log({
            type: LogType.JOIN_LEAVE,
            priority: LogPriority.INFO,
            action: "MEMBER_LEAVE",
            content: `Member **${member.user.tag}** (${member.id}) left the server.`,
            userId: member.id,
            guildId: member.guild.id,
            metadata: { 
                joinedAt: member.joinedAt,
                roles: member.roles.cache.map(r => r.name)
            }
        });
    },
};

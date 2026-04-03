import { Events, GuildMember } from "discord.js";
import { R3NDERClient } from "../client/R3nderClient";
import { LogType, LogPriority } from "../database/shared/Log";

export default {
    name: Events.GuildMemberAdd,
    async execute(client: R3NDERClient, member: GuildMember): Promise<void> {
        client.logs.log({
            type: LogType.JOIN_LEAVE,
            priority: LogPriority.INFO,
            action: "MEMBER_JOIN",
            content: `Member **${member.user.tag}** (${member.id}) joined the server.`,
            userId: member.id,
            guildId: member.guild.id,
            metadata: { 
                accountCreated: member.user.createdAt,
                bot: member.user.bot
            }
        });
    },
};

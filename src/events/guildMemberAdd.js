"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Log_1 = require("../database/shared/Log");
exports.default = {
    name: discord_js_1.Events.GuildMemberAdd,
    async execute(client, member) {
        client.logs.log({
            type: Log_1.LogType.JOIN_LEAVE,
            priority: Log_1.LogPriority.INFO,
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

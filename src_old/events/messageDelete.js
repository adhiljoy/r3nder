"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Log_1 = require("../database/shared/Log");
exports.default = {
    name: discord_js_1.Events.MessageDelete,
    async execute(client, message) {
        if (!message.guild || message.author?.bot)
            return;
        client.logs.log({
            type: Log_1.LogType.MESSAGE,
            priority: Log_1.LogPriority.INFO,
            action: "MESSAGE_DELETE",
            content: `Message from **${message.author?.tag}** was deleted in **#${message.channel.name}**`,
            userId: message.author?.id,
            guildId: message.guild.id,
            metadata: {
                content: message.content,
                channelId: message.channel.id,
                attachments: message.attachments.size > 0
            }
        });
    },
};

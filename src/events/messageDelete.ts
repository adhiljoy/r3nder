import { Events, Message } from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import { LogType, LogPriority } from "@database/Log";

export default {
    name: Events.MessageDelete,
    async execute(client: R3NDERClient, message: Message): Promise<void> {
        if (!message.guild || message.author?.bot) return;

        client.logs.log({
            type: LogType.MESSAGE,
            priority: LogPriority.INFO,
            action: "MESSAGE_DELETE",
            content: `Message from **${message.author?.tag}** was deleted in **#${(message.channel as any).name}**`,
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

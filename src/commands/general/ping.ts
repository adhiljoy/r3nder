import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { R3NDERClient } from "../../client/R3nderClient";
import { Command } from "../../types/index";

const ping: Command = {
    data: new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),
    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply({
            embeds: [
                {
                    title: "💎 R3NDER",
                    description: "A next-generation Discord automation platform",
                    color: 0x5865F2,
                    fields: [
                        {
                            name: "👨‍💻 Developer",
                            value: "Adhil Joy (Built independently)",
                        },
                        {
                            name: "⚡ Development Time",
                            value: "~1 day",
                        },
                        {
                            name: "📶 Latency",
                            value: `${client.ws.ping}ms`,
                            inline: true,
                        },
                    ],
                    footer: {
                        text: "Built from scratch 🚀",
                    },
                },
            ],
        });
    },
};
export default ping;

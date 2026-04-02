import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { R3NDERClient } from "../../client/R3nderClient";
import { Command } from "../../types/index";

const ping: Command = {
    data: new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),
    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply({ content: `Pong! 🏓 Latency: ${client.ws.ping}ms` });
    },
};
export default ping;

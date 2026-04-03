"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const ping = {
    data: new discord_js_1.SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),
    async execute(client, interaction) {
        await interaction.reply({ content: `Pong! 🏓 Latency: ${client.ws.ping}ms` });
    },
};
exports.default = ping;

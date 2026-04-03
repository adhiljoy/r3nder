"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const stop = {
    data: new discord_js_1.SlashCommandBuilder().setName("stop").setDescription("Stop music and clear the queue"),
    async execute(client, interaction) {
        try {
            await client.music.stop(interaction.guildId);
            await interaction.reply({ content: "🛑 Stopped music and cleared the queue." });
        }
        catch (error) {
            await interaction.reply({ content: `❌ ${error.message}`, ephemeral: true });
        }
    },
};
exports.default = stop;

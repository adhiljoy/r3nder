"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const skip = {
    data: new discord_js_1.SlashCommandBuilder().setName("skip").setDescription("Skip the current song"),
    async execute(client, interaction) {
        try {
            await client.music.skip(interaction.guildId);
            await interaction.reply({ content: "⏭️ Skipped!" });
        }
        catch (error) {
            await interaction.reply({ content: `❌ ${error.message}`, ephemeral: true });
        }
    },
};
exports.default = skip;

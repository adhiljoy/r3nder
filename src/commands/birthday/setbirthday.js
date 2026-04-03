"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const User_1 = require("../../database/shared/User");
const setbirthday = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("setbirthday").setDescription("Set your birthday for an auto-wish")
        .addIntegerOption(o => o.setName("day").setDescription("Day of your birthday").setRequired(true))
        .addIntegerOption(o => o.setName("month").setDescription("Month (1-12)").setRequired(true)),
    async execute(client, interaction) {
        const day = interaction.options.getInteger("day", true);
        const month = interaction.options.getInteger("month", true);
        if (day < 1 || day > 31 || month < 1 || month > 12) {
            await interaction.reply({ content: "❌ Invalid date.", ephemeral: true });
            return;
        }
        try {
            const birthday = new Date();
            birthday.setMonth(month - 1);
            birthday.setDate(day);
            await User_1.User.findOneAndUpdate({ userId: interaction.user.id, guildId: interaction.guildId }, { birthday }, { upsert: true });
            await interaction.reply({ content: `🎂 Birthday set to **${day}/${month}**!` });
        }
        catch (error) {
            await interaction.reply({ content: "❌ Error setting birthday.", ephemeral: true });
        }
    },
};
exports.default = setbirthday;

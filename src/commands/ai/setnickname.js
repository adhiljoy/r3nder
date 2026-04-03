"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const User_1 = require("../../database/shared/User");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("setnickname")
        .setDescription("Set a personalized nickname for R3NDER to call you.")
        .addStringOption(option => option.setName("nickname")
        .setDescription("The name you want the AI to use (max 32 characters)")
        .setRequired(true)
        .setMaxLength(32)),
    async execute(client, interaction) {
        const nickname = interaction.options.getString("nickname", true);
        try {
            let userData = await User_1.User.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
            if (!userData) {
                userData = new User_1.User({
                    userId: interaction.user.id,
                    guildId: interaction.guildId,
                    nickname: nickname,
                    nicknameAsked: true // Setting manually counts as asked/answered
                });
            }
            else {
                userData.nickname = nickname;
                userData.nicknameAsked = true;
            }
            await userData.save();
            await interaction.reply({
                content: `✅ Got it! From now on, I'll occasionally call you **${nickname}**.`,
                ephemeral: true
            });
        }
        catch (error) {
            console.error("[SetNickname Command Error]", error);
            await interaction.reply({
                content: "❌ An error occurred while saving your nickname. Please try again later.",
                ephemeral: true
            });
        }
    }
};

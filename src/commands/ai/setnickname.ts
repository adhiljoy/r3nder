import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { R3NDERClient } from "../../client/R3nderClient";
import { User } from "../../database/shared/User";

export default {
    data: new SlashCommandBuilder()
        .setName("setnickname")
        .setDescription("Set a personalized nickname for R3NDER to call you.")
        .addStringOption(option =>
            option.setName("nickname")
                .setDescription("The name you want the AI to use (max 32 characters)")
                .setRequired(true)
                .setMaxLength(32)
        ),

    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const nickname = interaction.options.getString("nickname", true);

        try {
            let userData = await User.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
            
            if (!userData) {
                userData = new User({ 
                    userId: interaction.user.id, 
                    guildId: interaction.guildId!,
                    nickname: nickname,
                    nicknameAsked: true // Setting manually counts as asked/answered
                });
            } else {
                userData.nickname = nickname;
                userData.nicknameAsked = true;
            }

            await userData.save();

            await interaction.reply({
                content: `✅ Got it! From now on, I'll occasionally call you **${nickname}**.`,
                ephemeral: true
            });

        } catch (error) {
            console.error("[SetNickname Command Error]", error);
            await interaction.reply({
                content: "❌ An error occurred while saving your nickname. Please try again later.",
                ephemeral: true
            });
        }
    }
};

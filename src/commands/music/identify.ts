import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ChatInputCommandInteraction } from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import axios from "axios";

export default {
    data: new SlashCommandBuilder()
        .setName("identify")
        .setDescription("Identify music from an uploaded audio file.")
        .addAttachmentOption(option =>
            option.setName("audio")
                .setDescription("The audio file to identify (mp3, wav, m4a, ogg)")
                .setRequired(true)
        ),

    async execute(client: R3NDERClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const attachment = interaction.options.getAttachment("audio", true);
        const allowedExtensions = ["mp3", "wav", "m4a", "ogg", "aac", "flac"];
        const extension = attachment.name?.split(".").pop()?.toLowerCase();

        // 1. Validate File Type
        if (!extension || !allowedExtensions.includes(extension)) {
            await interaction.reply({
                content: "❌ Invalid file type. Please upload a supported audio format (mp3, wav, m4a, ogg).",
                ephemeral: true
            });
            return;
        }

        // 2. Validate File Size (Max 10MB)
        if (attachment.size > 10 * 1024 * 1024) {
            await interaction.reply({
                content: "❌ File too large. Maximum size is 10MB.",
                ephemeral: true
            });
            return;
        }

        // 3. Rate Limiting (1/min per user)
        const rateLimitKey = `music_identify:${interaction.user.id}`;
        if (!client.ratelimit.check(rateLimitKey, 1, 60000)) {
            await interaction.reply({
                content: "⏳ Please wait a minute before identifying another song.",
                ephemeral: true
            });
            return;
        }

        await interaction.deferReply();

        try {
            // 4. Download Audio
            const response = await axios.get(attachment.url, { responseType: "arraybuffer" });
            const buffer = Buffer.from(response.data as any);

            // 5. Identify via ACRCloud
            const result = await client.musicRecognition.identify(buffer);

            if (result.status.code !== 0 || !result.metadata?.music || result.metadata.music.length === 0) {
                const errorMsg = result.status.code === 1001 ? "No match found for this audio." : `ACRCloud Error: ${result.status.msg}`;
                await interaction.editReply({ content: `🔍 **Identification Result:** ${errorMsg}` });
                return;
            }

            // 6. Parse Top Match
            const topMatch = result.metadata.music[0];
            const artistNames = topMatch.artists.map(a => a.name).join(", ");
            const confidence = topMatch.score;
            const isUncertain = confidence < 60;

            const embed = new EmbedBuilder()
                .setTitle("🎵 Song Identified")
                .setDescription(isUncertain ? "⚠️ *I found a potential match, but I'm not 100% sure.*" : "✅ *I've successfully identified this song!*")
                .addFields(
                    { name: "Title", value: topMatch.title, inline: true },
                    { name: "Artist", value: artistNames, inline: true },
                    { name: "Album", value: topMatch.album?.name || "Unknown", inline: true },
                    { name: "Confidence", value: `${confidence}%`, inline: true }
                )
                .setColor(isUncertain ? "#FFA500" : "#5865F2")
                .setTimestamp()
                .setFooter({ text: "Powered by ACRCloud", iconURL: client.user?.displayAvatarURL() });

            // Handle alternative matches
            if (result.metadata.music.length > 1) {
                const alts = result.metadata.music.slice(1, 4)
                    .map((m, i) => `${i + 1}. **${m.title}** by ${m.artists.map(a => a.name).join(", ")} (${m.score}%)`)
                    .join("\n");
                embed.addFields({ name: "Alternatives", value: alts });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("[Identify Command Error]", error);
            await interaction.editReply({ content: "❌ An error occurred while trying to identify the music. Please try again later." });
        }
    }
};

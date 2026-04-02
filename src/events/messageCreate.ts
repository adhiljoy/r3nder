import { Events, Message, TextChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder } from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";
import { User } from "@database/User";
import { LogType, LogPriority } from "@database/Log";
import { Guild } from "@database/Guild";

export default {
    name: Events.MessageCreate,
    async execute(client: R3NDERClient, message: Message): Promise<void> {
        if (message.author.bot || !message.guild) return;

        // 1. Record activity for Autopilot re-engagement & Analytics
        client.autopilot.recordActivity(message.channelId);
        client.analytics.trackMessage(message.guild.id, message.author.id);

        // 2. Intelligent Risk Analysis
        const risk = await client.risk.analyzeUser(message.author.id, message.guild.id);
        if (risk.level === "CRITICAL") {
            client.logs.critical(
                "USER_RISK_ALERT",
                `⚠️ **CRITICAL RISK**: User ${message.author.tag} (${message.author.id}) triggered critical security thresholds. Reasons: ${risk.reasons.join(", ")}`,
                message.guild.id
            );
        } else if (risk.level === "HIGH") {
            client.logs.warn(
                "USER_RISK_WARN",
                `⚠️ **HIGH RISK**: User ${message.author.tag} has unusual activity patterns. Reasons: ${risk.reasons.join(", ")}`,
                message.guild.id
            );
        }

        // 3. Fetch Guild Data
        const guildData = await Guild.findOne({ guildId: message.guild.id });
        if (!guildData) return;

        // 4. AI Moderation (Toxicity Filter)
        const wasModerated = await client.moderation.processMessage(message);
        if (wasModerated) return; // Stop if message was deleted/moderated

        // 4. Legacy Automod (Links)
        if (guildData.automod.antiLink) {
            const hasLink = /(https?:\/\/[^\s]+)/g.test(message.content);
            if (hasLink && !message.member?.permissions.has("ManageMessages")) {
                await message.delete().catch(() => {});
                if (message.channel.isTextBased()) {
                    (message.channel as TextChannel).send(`⚠️ <@${message.author.id}>, links are not allowed here!`)
                        .then((m: Message) => setTimeout(() => m.delete().catch(() => {}), 3000));
                }
                return;
            }
        }

        // 5. XP & Leveling System
        const xpRateLimitKey = `xp:${message.author.id}:${message.guild.id}`;
        if (client.ratelimit.check(xpRateLimitKey, 1, 60000)) {
            try {
                const xpToAdd = Math.floor(Math.random() * 10) + 15;
                let userData = await User.findOne({ userId: message.author.id, guildId: message.guild.id });
                if (!userData) {
                    userData = new User({ userId: message.author.id, guildId: message.guild.id, xp: xpToAdd, level: 1 });
                } else {
                    userData.xp += xpToAdd;
                    const nextLevelXp = userData.level * 100 * (userData.level * 1.5);
                    if (userData.xp >= nextLevelXp) {
                        userData.level += 1;
                        if (message.channel.isTextBased()) {
                            const embed = new EmbedBuilder()
                                .setTitle("🆙 Level Up!")
                                .setDescription(`🎉 Congrats **${message.author.username}**! You reached **Level ${userData.level}**!`)
                                .setColor("#FEE75C");
                            await (message.channel as TextChannel).send({ content: `<@${message.author.id}>`, embeds: [embed] });
                        }
                    }
                }
                await userData.save();
            } catch (error: unknown) {
                console.error("[Leveling Error]", error);
            }
        }

        // 6. AI Interaction (Triggers, Mentions & Auto-Reply via Autopilot)
        const handledByAI = await client.autopilot.handleMessage(message, guildData);
        if (handledByAI) return;

        // 7. Global Logging (Real-time Event Tracking)
        client.logs.log({
            type: LogType.MESSAGE,
            priority: LogPriority.INFO,
            action: "MESSAGE_CREATE",
            content: `Message in #${(message.channel as TextChannel).name}: ${message.content.slice(0, 100)}${message.content.length > 100 ? "..." : ""}`,
            userId: message.author.id,
            guildId: message.guild.id,
            metadata: { channelId: message.channelId }
        });

        // 8. Personalization Promotion (Interaction #5)
        let userData = await User.findOne({ userId: message.author.id, guildId: message.guild.id });
        if (userData && userData.interactionCount === 5 && !userData.nickname && !userData.nicknameAsked) {
            const row = new ActionRowBuilder<MessageActionRowComponentBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`nick_yes_${message.author.id}`)
                        .setLabel("Yes, please!")
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`nick_no_${message.author.id}`)
                        .setLabel("No thanks")
                        .setStyle(ButtonStyle.Secondary)
                );

            const askEmbed = new EmbedBuilder()
                .setTitle("🧠 Personalized Experience")
                .setDescription("I've enjoyed our conversation! Would you like me to set a nickname for you so I can address you more personally?")
                .setColor("#5865F2");

            const askMsg = await message.reply({ embeds: [askEmbed], components: [row] });

            // Handle response
            const filter = (i: any) => i.user.id === message.author.id;
            const collector = askMsg.createMessageComponentCollector({ filter, time: 30000, max: 1 });

            collector.on("collect", async i => {
                // Track Analytics
                client.analytics.trackMessage(message.guildId!, message.author.id);

                if (i.customId.startsWith("nick_yes")) {
                    await i.reply({ content: "Great! Please use `/setnickname` to tell me what you'd like to be called.", ephemeral: true });
                } else {
                    userData!.nicknameAsked = true;
                    await userData!.save();
                    await i.reply({ content: "No problem! I'll stick to being professional. You can always change this later with `/setnickname`.", ephemeral: true });
                }
                await askMsg.delete().catch(() => {});
            });
        }
    },
};

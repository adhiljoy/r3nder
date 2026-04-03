"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const User_1 = require("../database/shared/User");
const Log_1 = require("../database/shared/Log");
const Guild_1 = require("../database/shared/Guild");
exports.default = {
    name: discord_js_1.Events.MessageCreate,
    async execute(client, message) {
        if (message.author.bot || !message.guild)
            return;
        // 1. Record activity for Autopilot re-engagement & Analytics
        client.autopilot.recordActivity(message.channelId);
        client.analytics.trackMessage(message.guild.id, message.author.id);
        // 2. Intelligent Risk Analysis
        const risk = await client.risk.analyzeUser(message.author.id, message.guild.id);
        if (risk.level === "CRITICAL") {
            client.logs.critical("USER_RISK_ALERT", `⚠️ **CRITICAL RISK**: User ${message.author.tag} (${message.author.id}) triggered critical security thresholds. Reasons: ${risk.reasons.join(", ")}`, message.guild.id);
        }
        else if (risk.level === "HIGH") {
            client.logs.warn("USER_RISK_WARN", `⚠️ **HIGH RISK**: User ${message.author.tag} has unusual activity patterns. Reasons: ${risk.reasons.join(", ")}`, message.guild.id);
        }
        // 3. Fetch Guild Data
        const guildData = await Guild_1.Guild.findOne({ guildId: message.guild.id });
        if (!guildData)
            return;
        // 4. AI Moderation (Toxicity Filter)
        const wasModerated = await client.moderation.processMessage(message);
        if (wasModerated)
            return; // Stop if message was deleted/moderated
        // 4. Legacy Automod (Links)
        if (guildData.automod.antiLink) {
            const hasLink = /(https?:\/\/[^\s]+)/g.test(message.content);
            if (hasLink && !message.member?.permissions.has("ManageMessages")) {
                await message.delete().catch(() => { });
                if (message.channel.isTextBased()) {
                    message.channel.send(`⚠️ <@${message.author.id}>, links are not allowed here!`)
                        .then((m) => setTimeout(() => m.delete().catch(() => { }), 3000));
                }
                return;
            }
        }
        // 5. XP & Leveling System
        const xpRateLimitKey = `xp:${message.author.id}:${message.guild.id}`;
        if (client.ratelimit.check(xpRateLimitKey, 1, 60000)) {
            try {
                const xpToAdd = Math.floor(Math.random() * 10) + 15;
                let userData = await User_1.User.findOne({ userId: message.author.id, guildId: message.guild.id });
                if (!userData) {
                    userData = new User_1.User({ userId: message.author.id, guildId: message.guild.id, xp: xpToAdd, level: 1 });
                }
                else {
                    userData.xp += xpToAdd;
                    const nextLevelXp = userData.level * 100 * (userData.level * 1.5);
                    if (userData.xp >= nextLevelXp) {
                        userData.level += 1;
                        if (message.channel.isTextBased()) {
                            const embed = new discord_js_1.EmbedBuilder()
                                .setTitle("🆙 Level Up!")
                                .setDescription(`🎉 Congrats **${message.author.username}**! You reached **Level ${userData.level}**!`)
                                .setColor("#FEE75C");
                            await message.channel.send({ content: `<@${message.author.id}>`, embeds: [embed] });
                        }
                    }
                }
                await userData.save();
            }
            catch (error) {
                console.error("[Leveling Error]", error);
            }
        }
        // 6. AI Interaction (Triggers, Mentions & Auto-Reply via Autopilot)
        const handledByAI = await client.autopilot.handleMessage(message, guildData);
        if (handledByAI)
            return;
        // 7. Global Logging (Real-time Event Tracking)
        client.logs.log({
            type: Log_1.LogType.MESSAGE,
            priority: Log_1.LogPriority.INFO,
            action: "MESSAGE_CREATE",
            content: `Message in #${message.channel.name}: ${message.content.slice(0, 100)}${message.content.length > 100 ? "..." : ""}`,
            userId: message.author.id,
            guildId: message.guild.id,
            metadata: { channelId: message.channelId }
        });
        // 8. Personalization Promotion (Interaction #5)
        let userData = await User_1.User.findOne({ userId: message.author.id, guildId: message.guild.id });
        if (userData && userData.interactionCount === 5 && !userData.nickname && !userData.nicknameAsked) {
            const row = new discord_js_1.ActionRowBuilder()
                .addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId(`nick_yes_${message.author.id}`)
                .setLabel("Yes, please!")
                .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
                .setCustomId(`nick_no_${message.author.id}`)
                .setLabel("No thanks")
                .setStyle(discord_js_1.ButtonStyle.Secondary));
            const askEmbed = new discord_js_1.EmbedBuilder()
                .setTitle("🧠 Personalized Experience")
                .setDescription("I've enjoyed our conversation! Would you like me to set a nickname for you so I can address you more personally?")
                .setColor("#5865F2");
            const askMsg = await message.reply({ embeds: [askEmbed], components: [row] });
            // Handle response
            const filter = (i) => i.user.id === message.author.id;
            const collector = askMsg.createMessageComponentCollector({ filter, time: 30000, max: 1 });
            collector.on("collect", async (i) => {
                // Track Analytics
                client.analytics.trackMessage(message.guildId, message.author.id);
                if (i.customId.startsWith("nick_yes")) {
                    await i.reply({ content: "Great! Please use `/setnickname` to tell me what you'd like to be called.", ephemeral: true });
                }
                else {
                    userData.nicknameAsked = true;
                    await userData.save();
                    await i.reply({ content: "No problem! I'll stick to being professional. You can always change this later with `/setnickname`.", ephemeral: true });
                }
                await askMsg.delete().catch(() => { });
            });
        }
    },
};

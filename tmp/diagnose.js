const mongoose = require('mongoose');
require('dotenv').config();

const GuildSchema = new mongoose.Schema({ guildId: String });
const LogSchema = new mongoose.Schema({ guildId: String, channelId: String, type: String });

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Guild = mongoose.model('GuildDiagnostics', GuildSchema, 'guilds');
        const Log = mongoose.model('LogDiagnostics', LogSchema, 'logs');

        const g = await Guild.findOne();
        const l = await Log.findOne({ type: 'VOICE_JOIN' }).sort({ timestamp: -1 });
        const allLogs = await Log.find({ guildId: g?.guildId, channelId: { $ne: null } }).limit(5);

        console.log(JSON.stringify({
            guildId: g?.guildId || null,
            channelId: l?.channelId || null,
            recentChannels: allLogs.map(log => log.channelId)
        }));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

diagnose();

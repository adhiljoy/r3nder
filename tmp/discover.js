const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client.once('ready', async () => {
    try {
        const guild = await client.guilds.fetch("1243617527737745508");
        const channels = await guild.channels.fetch();
        const voiceChannel = channels.find(c => c.type === ChannelType.GuildVoice);
        
        console.log(JSON.stringify({
            guildId: guild.id,
            channelId: voiceChannel ? voiceChannel.id : null,
            channelName: voiceChannel ? voiceChannel.name : null
        }));
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
});

client.login(process.env.TOKEN);

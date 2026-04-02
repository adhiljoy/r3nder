const axios = require('axios');

async function testMusic() {
    const guildId = "1243617527737745508";
    const channelId = "1243617528073162789";
    const query = "lofi hip hop";
    const userId = "453406325555134475";
    
    try {
        console.log("Triggering music play...");
        const response = await axios.post(`http://localhost:3002/music/${guildId}/control`, {
            action: "play",
            value: query,
            channelId: channelId,
            userId: userId
        });
        console.log("Response:", response.data);
    } catch (e) {
        console.error("Error:", e.response?.data || e.message);
    }
}

testMusic();

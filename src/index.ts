import { GatewayIntentBits, Partials } from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";

const client = new R3NDERClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember],
});

client.initialize().catch((error: Error) => {
    console.error("[Index Error] Failed to initialize R3NDER:", error);
});

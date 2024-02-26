import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
    ],
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

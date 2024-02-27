import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { CommandConnect } from './commands/CommandConnect';
import { CommandHandler } from './commands/CommandHandler';
import { CommandDisconnect } from './commands/CommandDisconnect';
import { ConnectionMap } from './connection/ConnectionMap';
import { CommandFilter } from './commands/CommandFilter';
import mongoose from 'mongoose';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const commandHandler = new CommandHandler(client);

const connectionMap = ConnectionMap.forClient(client);

client.on('ready', async () => {
    console.log(`Logged in as ${client.user?.tag}`);
    commandHandler.addCommands(
        new CommandConnect(),
        new CommandDisconnect(),
        new CommandFilter(),
    );
    await commandHandler.registerAll();
});

client.on('messageCreate', async (message) => {
    if (!message.inGuild()) {
        return;
    }
    await connectionMap.handleMessage(message);
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
        commandHandler.handle(interaction);
    }
});

process.on('SIGINT', async () => {
    connectionMap.destroy();
    console.log('Destroyed all connections');
    await client.destroy();
    console.log('Destroyed the client');
    await mongoose.disconnect();
    console.log('Closed the database connection');
});

client.login(process.env.DISCORD_TOKEN);

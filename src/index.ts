import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { CommandConnect } from './commands/CommandConnect';
import { CommandHandler } from './commands/CommandHandler';
import { CommandDisconnect } from './commands/CommandDisconnect';
import { ConnectionMap } from './connection/ConnectionMap';

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
    commandHandler.addCommand(new CommandConnect());
    commandHandler.addCommand(new CommandDisconnect());
    await commandHandler.registerAll();
});

client.on('messageCreate', async (message) => {
    if (!message.inGuild()) {
        return;
    }
    await connectionMap.handleMessage(message);
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        commandHandler.handle(interaction);
    }
});

process.on('SIGINT', () => {
    connectionMap.destroy();
    console.log('Destroyed all connections');
    client.destroy();
    console.log('Destroyed the client');
});

client.login(process.env.DISCORD_TOKEN);

import 'dotenv/config';
import { AttachmentBuilder, Client, GatewayIntentBits } from 'discord.js';
import { VoicevoxClient } from './voicevox/VoicevoxClient';
import { CommandConnect } from './commands/CommandConnect';
import { CommandManager as CommandHandler } from './commands/CommandManager';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const commandHandler = new CommandHandler(client);

const voicevoxClient = new VoicevoxClient(
    `http://localhost:${process.env.VOICEVOX_PORT}`,
);

client.on('ready', async () => {
    console.log(`Logged in as ${client.user?.tag}`);
    commandHandler.addCommand(new CommandConnect());
    await commandHandler.registerAll();
});

client.on('messageCreate', async (message) => {
    const text = message.content.trim();
    if (text == '') {
        return;
    }
    const query = await voicevoxClient.getAudioQuery(text, 1);
    const buffer = Buffer.from(await voicevoxClient.synthesize(query, 1));
    await message.reply({
        files: [new AttachmentBuilder(buffer).setName('audio.wav')],
    });
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        commandHandler.handle(interaction);
    }
})

client.login(process.env.DISCORD_TOKEN);

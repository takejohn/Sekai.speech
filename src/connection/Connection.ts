import {
    VoiceConnection,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} from '@discordjs/voice';
import { GuildTextBasedChannel, Message, VoiceBasedChannel } from 'discord.js';
import { VoicevoxClient } from '../voicevox/VoicevoxClient';
import { Readable } from 'stream';
import { Filter } from '../filter/Filter';

export class Connection {
    private readonly voice: VoiceConnection;

    private readonly textChannels = new Set<string>();

    private readonly player = createAudioPlayer();

    private constructor(
        readonly channel: VoiceBasedChannel,
        private readonly voicevox: VoicevoxClient,
        private readonly filter: Filter,
    ) {
        const guild = channel.guild;
        this.voice = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
        });
        this.voice.subscribe(this.player);
    }

    public static async create(
        channel: VoiceBasedChannel,
        voicevox: VoicevoxClient,
    ) {
        const filter = await Filter.get(channel.client, channel.guild);
        return new Connection(channel, voicevox, filter);
    }

    addTextChannel(textChannel: GuildTextBasedChannel) {
        this.textChannels.add(textChannel.id);
    }

    removeTextChannel(textChannel: GuildTextBasedChannel) {
        this.textChannels.delete(textChannel.id);
    }

    async handleMessage(message: Message<true>) {
        if (!this.textChannels.has(message.channel.id)) {
            return;
        }
        const text = await this.filter.apply(message.content);
        console.log(`before: '${message.content}', after: '${text}'`);
        if (/^\s*$/.test(text)) {
            return;
        }
        const query = await this.voicevox.getAudioQuery(text, 1);
        const arrayBuffer = await this.voicevox.synthesize(query, 1);
        const buffer = Buffer.from(arrayBuffer);
        const readable = Readable.from(buffer);
        const resource = createAudioResource(readable);
        this.player.play(resource);
    }

    destroy() {
        this.voice.destroy();
    }
}

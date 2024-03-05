import {
    VoiceConnection,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} from '@discordjs/voice';
import {
    GuildTextBasedChannel,
    Message,
    VoiceBasedChannel,
    VoiceState,
} from 'discord.js';
import { VoicevoxClient } from '../voicevox/VoicevoxClient';
import { Readable } from 'stream';
import { Filter } from '../filter/Filter';
import { QueuePlayer } from './QueuePlayer';

export class Connection {
    private readonly voice: VoiceConnection;

    private readonly textChannels = new Set<string>();

    private readonly queuePlayer = new QueuePlayer(createAudioPlayer());

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
        this.voice.subscribe(this.queuePlayer.player);
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
        const text = await this.filter.apply(message.cleanContent);
        this.speech(text);
    }

    async speech(text: string) {
        if (/^\s*$/.test(text)) {
            return;
        }
        const query = await this.voicevox.getAudioQuery(text, 1);
        const arrayBuffer = await this.voicevox.synthesize(query, 1);
        const buffer = Buffer.from(arrayBuffer);
        const readable = Readable.from(buffer);
        const resource = createAudioResource(readable);
        this.queuePlayer.play(resource);
    }

    async handleVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
        const channel = this.channel;
        const member = oldState.member;
        if (member == null) {
            return;
        }
        if (newState.channel?.id == channel.id) {
            this.speech(
                `${member.nickname}さんが${channel.name}に接続しました`,
            );
        } else if (oldState.channel?.id == channel.id) {
            this.speech(
                `${member.nickname}さんが${channel.name}から切断しました`,
            );
        }
    }

    destroy() {
        this.voice.destroy();
    }
}

import { VoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import {
    AttachmentBuilder,
    GuildTextBasedChannel,
    Message,
    VoiceBasedChannel,
} from 'discord.js';
import { VoicevoxClient } from '../voicevox/VoicevoxClient';

export class Connection {
    private readonly voice: VoiceConnection;

    private readonly textChannels = new Set<string>();

    constructor(
        readonly channel: VoiceBasedChannel,
        private readonly voicevox: VoicevoxClient,
    ) {
        const guild = channel.guild;
        this.voice = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
        });
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
        const text = message.content.trim();
        if (text == '') {
            return;
        }
        const query = await this.voicevox.getAudioQuery(text, 1);
        const buffer = Buffer.from(await this.voicevox.synthesize(query, 1));
        await message.reply({
            files: [new AttachmentBuilder(buffer).setName('audio.wav')],
        });
    }

    destroy() {
        this.voice.destroy();
    }
}

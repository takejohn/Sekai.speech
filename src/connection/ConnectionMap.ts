import { VoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import {
    ChannelResolvable,
    Client,
    GuildResolvable,
    VoiceBasedChannel,
} from 'discord.js';
import { requireChannel } from '../util/channels';

export class ConnectionMap {
    private static readonly instances = new Map<Client, ConnectionMap>();

    private readonly connections = new Map<string, VoiceConnection>();

    private constructor(public readonly client: Client) {}

    static forClient(client: Client) {
        const existing = this.instances.get(client);
        if (existing != null) {
            return existing;
        }
        const created = new ConnectionMap(client);
        this.instances.set(client, created);
        return created;
    }

    get(channel: ChannelResolvable) {
        const channelId = requireChannel(this.client.channels, channel).id;
        return this.connections.get(channelId) ?? null;
    }

    join(channel: VoiceBasedChannel) {
        const guild = channel.guild;
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
        });
        this.connections.set(channel.id, connection);
    }

    destroyConnection(channel: ChannelResolvable) {
        const channelId = requireChannel(this.client.channels, channel).id;
        const connection = this.connections.get(channelId);
        if (connection == null) {
            return false;
        }
        connection.destroy();
        this.connections.delete(channelId);
        return true;
    }
}

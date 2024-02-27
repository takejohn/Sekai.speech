import {
    Client,
    GuildResolvable,
    Message,
    VoiceBasedChannel,
} from 'discord.js';
import { requireGuild } from '../util/guilds';
import { Connection } from './Connection';
import { VoicevoxClient } from '../voicevox/VoicevoxClient';

export class ConnectionMap {
    private static readonly instances = new Map<Client, ConnectionMap>();

    private readonly connections = new Map<string, Connection>();

    private readonly voicevoxClient = new VoicevoxClient(
        `http://localhost:${process.env.VOICEVOX_PORT}`,
    );

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

    get(guild: GuildResolvable) {
        const guildId = requireGuild(this.client.guilds, guild).id;
        return this.connections.get(guildId) ?? null;
    }

    join(channel: VoiceBasedChannel) {
        const guild = channel.guild;
        this.destroyConnection(guild);
        const connection = new Connection(channel, this.voicevoxClient);
        this.connections.set(guild.id, connection);
        return connection;
    }

    destroyConnection(guild: GuildResolvable) {
        const guildResolved = requireGuild(this.client.guilds, guild);
        const connection = this.get(guild);
        if (connection == null) {
            return false;
        }
        connection.destroy();
        this.connections.delete(guildResolved.id);
        return true;
    }

    async handleMessage(message: Message<true>) {
        await this.get(message.guild)?.handleMessage(message);
    }
}

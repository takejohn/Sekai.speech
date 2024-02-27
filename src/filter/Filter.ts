import { Client, Guild, GuildResolvable } from 'discord.js';
import { wordModel } from '../database/database';
import { requireGuild } from '../util/guilds';

function findPrefix(
    candidates: readonly string[],
    input: string,
    position: number,
) {
    for (const candidate of candidates) {
        if (input.startsWith(candidate, position)) {
            return candidate;
        }
    }
    return null;
}

export class Filter {
    private static instances = new Map<string, Map<string, Filter>>();

    private readonly client: Client<true>;

    private readonly guild: Guild;

    private readonly cache;

    private writing = false;

    constructor(
        client: Client<true>,
        guild: Guild,
        cache: Map<string, string>,
    ) {
        this.client = client;
        this.guild = requireGuild(client.guilds, guild);
        this.cache = cache;
    }

    public static async get(client: Client<true>, guild: GuildResolvable): Promise<Filter> {
        const clientUserId = client.user.id;
        let guildMap = this.instances.get(clientUserId);
        if (guildMap != null) {
            const existing = this.instances.get(clientUserId)?.get(clientUserId);
            if (existing != null) {
                return existing;
            }
        } else {
            guildMap = new Map<string, Filter>();
            this.instances.set(clientUserId, guildMap);
        }
        const guildResolved = requireGuild(client.guilds, guild);
        const words = wordModel.find({
            client: clientUserId,
            guild: guildResolved.id,
        });
        const cache = new Map<string, string>();
        for await (const word of words) {
            const { input, output } = word;
            if (input != null && output != null) {
                cache.set(input, output);
            }
        }
        const result = new Filter(client, guildResolved, cache);
        guildMap.set(clientUserId, result);
        return result;
    }

    public isWriting() {
        return this.writing;
    }

    async apply(input: string) {
        let output = '';
        let index = 0;
        const length = input.length;
        const cache = this.cache;
        const keys = [...cache.keys()];
        while (index < length) {
            const prefix = findPrefix(keys, input, index);
            if (prefix != null) {
                output += cache.get(prefix);
                index += prefix.length;
            } else {
                output += input.charAt(index);
                index++;
            }
        }
        return output;
    }

    async findWord(input: string) {
        return this.cache.get(input);
    }

    async addWord(input: string, output: string): Promise<boolean> {
        if (this.cache.has(input)) {
            return false;
        }
        this.cache.set(input, output);
        this.writing = true;
        try {
            await wordModel.create({
                client: this.client.user.id,
                guild: this.guild.id,
                input,
                output,
            });
            return true;
        } catch (e) {
            throw e;
        } finally {
            this.writing = false;
        }
    }

    async removeWord(input: string): Promise<boolean> {
        if (!this.cache.has(input)) {
            return false;
        }
        this.cache.delete(input);
        this.writing = true;
        try {
            await wordModel.deleteOne({
                client: this.client.user.id,
                guild: this.guild.id,
                input: input,
            });
            return true;
        } catch (e) {
            throw e;
        } finally {
            this.writing = false;
        }
    }
}

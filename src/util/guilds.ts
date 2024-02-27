import { GuildManager, GuildResolvable } from 'discord.js';

export function requireGuild(
    guildManager: GuildManager,
    guild: GuildResolvable,
) {
    const result = guildManager.resolve(guild);
    if (result == null) {
        throw new TypeError(`Cannot resolve guild: ${guild}`);
    }
    return result;
}

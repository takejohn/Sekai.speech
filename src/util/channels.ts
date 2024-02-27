import { ChannelManager, ChannelResolvable } from 'discord.js';

export function requireChannel(
    channelManager: ChannelManager,
    channel: ChannelResolvable,
) {
    const result = channelManager.resolve(channel);
    if (result == null) {
        throw new TypeError(`Cannot resolve channel: ${channel}`);
    }
    return result;
}

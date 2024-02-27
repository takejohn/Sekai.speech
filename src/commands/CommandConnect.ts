import {
    SlashCommandBuilder,
    CommandInteraction,
    CacheType,
    GuildMember,
    VoiceBasedChannel,
} from 'discord.js';
import { VoiceChannelCommand } from './VoiceChannelCommand';
import { ConnectionMap } from '../connection/ConnectionMap';

export class CommandConnect extends VoiceChannelCommand {
    data = new SlashCommandBuilder()
        .setName('connect')
        .setDescription('ボイスチャンネルに接続します');

    executeWith = async (
        interaction: CommandInteraction<CacheType>,
        channel: VoiceBasedChannel,
    ) => {
        ConnectionMap.forClient(interaction.client).join(channel);
        await interaction.reply(`\`${channel.name}\`に接続しました`);
    };
}

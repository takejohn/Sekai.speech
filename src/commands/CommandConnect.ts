import {
    SlashCommandBuilder,
    CommandInteraction,
    CacheType,
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
        const textChannel = interaction.channel;
        if (textChannel == null || textChannel.isDMBased()) {
            return;
        }
        ConnectionMap.forClient(interaction.client)
            .join(channel)
            .addTextChannel(textChannel);
        await interaction.reply(`\`${channel.name}\`に接続しました`);
    };
}

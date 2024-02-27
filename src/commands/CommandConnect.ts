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
        const connectionMap = ConnectionMap.forClient(interaction.client);
        const connection = await connectionMap.join(channel);
        connection.addTextChannel(textChannel);
        await interaction.reply(`\`${channel.name}\`に接続しました`);
    };
}

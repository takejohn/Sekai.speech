import {
    SlashCommandBuilder,
    CommandInteraction,
    CacheType,
    VoiceBasedChannel,
} from 'discord.js';
import { ConnectionMap } from '../connection/ConnectionMap';
import { VoiceChannelCommand } from './VoiceChannelCommand';

export class CommandDisconnect extends VoiceChannelCommand {
    data = new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('ボイスチャンネルから切断します');

    executeWith = async (
        interaction: CommandInteraction<CacheType>,
        channel: VoiceBasedChannel,
    ) => {
        const success = ConnectionMap.forClient(
            interaction.client,
        ).destroyConnection(channel);
        if (!success) {
            await interaction.reply(
                'この bot はボイスチャンネルに参加していません！',
            );
            return;
        }
        await interaction.reply(`\`${channel.name}\`から切断しました`);
    };
}

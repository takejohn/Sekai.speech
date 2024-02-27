import {
    SlashCommandBuilder,
    CommandInteraction,
    CacheType,
    GuildMember,
    VoiceBasedChannel,
} from 'discord.js';
import { Command } from './Command';

export abstract class VoiceChannelCommand implements Command {
    abstract data: SlashCommandBuilder;

    execute = async (interaction: CommandInteraction) => {
        const member = interaction.member;
        const guild = interaction.guild;
        if (
            !(member instanceof GuildMember) ||
            guild == null ||
            !interaction.inGuild()
        ) {
            await interaction.reply(
                'このコマンドはサーバーのみで使用できます！',
            );
            return;
        }
        const me = guild.members.me;
        if (me == null) {
            await interaction.reply('この bot はサーバーに参加していません！');
            return;
        }
        const channel = member.voice.channel;
        if (channel == null) {
            await interaction.reply(
                'このコマンドはボイスチャンネルに接続してから実行してください！',
            );
            return;
        }
        const myChannel = me.voice.channel;
        if (myChannel != null && channel != myChannel) {
            await interaction.reply(
                'この bot と参加しているボイスチャンネルが異なります！',
            );
            return;
        }
        await this.executeWith(interaction, channel);
    };

    abstract executeWith(
        interaction: CommandInteraction<Exclude<CacheType, undefined>>,
        channel: VoiceBasedChannel,
    ): Promise<void>;
}

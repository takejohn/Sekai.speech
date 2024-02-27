import { SlashCommandBuilder, CommandInteraction, CacheType, GuildMember } from "discord.js";
import { Command } from "./Command";
import { joinVoiceChannel } from "@discordjs/voice";

export class CommandConnect implements Command {
    data = new SlashCommandBuilder()
        .setName('connect')
        .setDescription('ボイスチャンネルに接続します');

    execute = async (interaction: CommandInteraction<CacheType>) => {
        const member = interaction.member;
        const guild = interaction.guild;
        if (!(member instanceof GuildMember) || guild == null) {
            await interaction.reply('このコマンドはサーバーのみで使用できます！');
            return;
        }
        const channel = member.voice.channel;
        if (channel == null) {
            await interaction.reply('このコマンドはボイスチャンネルに接続してから実行してください！');
            return;
        }
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator
        });
        await interaction.reply(`\`${channel.name}\`に接続しました`);
    }
}

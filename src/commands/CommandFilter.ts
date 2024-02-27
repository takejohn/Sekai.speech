import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from './Command';
import { Filter } from '../filter/Filter';

export class CommandFilter implements Command {
    data = new SlashCommandBuilder()
        .setName('filter')
        .setDescription('フィルタを設定します')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('add')
                .setDescription('単語を追加します')
                .addStringOption((option) =>
                    option
                        .setName('input')
                        .setDescription('入力')
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName('output')
                        .setDescription('出力')
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('remove')
                .setDescription('単語を削除します')
                .addStringOption((option) =>
                    option
                        .setName('input')
                        .setDescription('入力')
                        .setRequired(true),
                ),
        );

    execute = async (interaction: ChatInputCommandInteraction) => {
        const guild = interaction.guild;
        if (guild == null) {
            await interaction.reply('このコマンドはセーバー内でのみ使用できます！');
            return;
        }
        const filter = await Filter.get(interaction.client, guild);
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case 'add':
                await add(interaction, filter);
                break;
            case 'remove':
                await remove(interaction, filter);
                break;
            default:
                await interaction.reply(`不明なサブコマンドです: ${subcommand}`);
        }
    };
}

async function add(interaction: ChatInputCommandInteraction, filter: Filter) {
    const input = interaction.options.getString('input', true);
    const output = interaction.options.getString('output', true);
    const success = await filter.addWord(input, output);
    if (success) {
        await interaction.reply({
            embeds: [
                {
                    title: '単語を追加しました',
                    description:
                        'input: `' + input + '`\noutput: `' + output + '`',
                },
            ],
        });
    } else {
        await interaction.reply({
            embeds: [
                {
                    title: 'その単語はすでに追加されています！',
                    description: 'input: `' + input + '`',
                },
            ],
        });
    }
}

async function remove(
    interaction: ChatInputCommandInteraction,
    filter: Filter,
) {
    const input = interaction.options.getString('input', true);
    const success = await filter.removeWord(input);
    if (success) {
        await interaction.reply({
            embeds: [
                {
                    title: '単語を削除しました',
                    description: 'input: `' + input + '`',
                },
            ],
        });
    } else {
        await interaction.reply({
            embeds: [
                {
                    title: 'その単語は追加されていないか、すでに削除されています！',
                    description: 'input: `' + input + '`',
                },
            ],
        });
    }
}

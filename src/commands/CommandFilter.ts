import { SlashCommandBuilder, CommandInteraction, CacheType } from "discord.js";
import { Command } from "./Command";
import { Filter } from "../filter/Filter";

export class CommandFilter implements Command {
    data = new SlashCommandBuilder()
        .setName('filter')
        .setDescription('フィルタを設定します')
        .addSubcommand(subcommand => subcommand
            .setName('add')
            .setDescription('単語を追加します')
            .addStringOption(option => option
                .setName('input')
                .setDescription('入力')
                .setRequired(true))
            .addStringOption(option => option
                .setName('output')
                .setDescription('出力')
                .setRequired(true)));

    execute = async (interaction: CommandInteraction<CacheType>) => {
        const guild = interaction.guild;
        if (guild == null) {
            interaction.reply('このコマンドはセーバー内でのみ使用できます！');
            return;
        }
        if (!interaction.isChatInputCommand()) {
            return;
        }
        const filter = await Filter.get(interaction.client, guild);
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case 'add':
                {
                    const input = interaction.options.getString('input', true);
                    const output = interaction.options.getString('output', true);
                    const success = await filter.addWord(input, output);
                    if (success) {
                        interaction.reply({
                            embeds: [{
                                title: '単語を追加しました',
                                description: 'input: `' + input + '`\noutput: `' + output + '`'
                            }]
                        });
                    } else {
                        interaction.reply({
                            embeds: [{
                                title: 'その単語はすでに追加されています！',
                                description: 'input: `' + input + '`'
                            }]
                        });
                    }
                }
                break;
            default:
                interaction.reply(`不明なサブコマンドです: ${subcommand}`);
        }
    }
}

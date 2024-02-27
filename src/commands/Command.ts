import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface Command {
    readonly data: SlashCommandBuilder;

    execute(interaction: CommandInteraction): Promise<void>;
}

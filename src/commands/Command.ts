import {
    ChatInputCommandInteraction,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

export interface Command {
    readonly data: SlashCommandSubcommandsOnlyBuilder;

    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

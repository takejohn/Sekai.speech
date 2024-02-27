import { Client, CommandInteraction } from "discord.js";
import { Command } from "./Command";

export class CommandHandler {
    private readonly commandMap = new Map<string, Command>();

    constructor(public readonly client: Client) {}

    addCommand(command: Command) {
        this.commandMap.set(command.data.name, command);
    }

    async registerAll() {
        const commandData = [];
        for (const [name, command] of this.commandMap) {
            commandData.push(command.data.toJSON());
        }
        await this.client.application?.commands.set(commandData);
    }

    async handle(interaction: CommandInteraction) {
        const commandName = interaction.commandName;
        const command = this.commandMap.get(commandName);
        if (command == null) {
            await interaction.reply(`コマンド\`${commandName}\`が見つかりません！`);
            return;
        }
        await command.execute(interaction);
    }
}

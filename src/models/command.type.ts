import * as Discord from 'discord.js';

interface CommandCommon {
    name: string;
    description: string;
    notAllowedChannels?: string[];
    allowedGuild: string[];
    requiredArgs?: number;
}

export type CommandWithArgs = {
    execute(
        msg: Discord.Message,
        args: string[]
    ): Promise<Discord.Message | Discord.Message[] | null>;
} & CommandCommon;

type CommandWithoutArgs = {
    execute(msg: Discord.Message): Promise<Discord.Message | Discord.Message[]>;
} & CommandCommon;

export type Command = CommandWithArgs | CommandWithoutArgs;

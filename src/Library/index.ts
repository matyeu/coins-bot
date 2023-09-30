import {
    ButtonInteraction,
    Client,
    ClientOptions,
    Collection,
    CommandInteraction,
    Guild,
    BaseMessageOptions, ModalSubmitInteraction, SelectMenuInteraction,
    Snowflake,
    TextChannel
} from 'discord.js';
import * as fs from "fs";
import { EMOJIS } from "../config";

export class CoinsClient extends Client {
    public config: Object;
    public slashCommands: Collection<any, any>;
    public messageCommands: Collection<any, any>;
    public cooldowns: Collection<any, any>;
    public musicPlayer: Collection<any, any>;
    public buttons: Collection<any, any>;
    public selects: Collection<any, any>;
    public modals: Collection<any, any>;
    public invite: Collection<any, any>;

    constructor(options: ClientOptions) {
        super(options);
        this.config = {};
        this.slashCommands = new Collection();
        this.messageCommands = new Collection();
        this.cooldowns = new Collection();
        this.musicPlayer = new Collection();
        this.buttons = new Collection();
        this.selects = new Collection();
        this.modals = new Collection();
        this.invite = new Collection();

    }

    getEmoji(id: Snowflake) {
        return this.emojis.cache.get(id);
    }

    getRole(guild: Guild, id: Snowflake) {
        return guild.roles.cache.get(id);
    }

    async getChannel(guild: Guild, snowflake: Snowflake, messageData: BaseMessageOptions) {
        if (snowflake) {
            let channel = <TextChannel>guild.channels.cache.get(snowflake);
            if (channel) {
                await channel.send(messageData);
            }
        }
    }

    async getClientChannel(client: CoinsClient, snowflake: Snowflake, messageData: BaseMessageOptions) {
        if (snowflake) {
            let channel = <TextChannel>client.channels.cache.get(snowflake);
            if (channel) {
                await channel.send(messageData);
            }
        }
    }
}

declare module "discord.js" {
    interface CommandInteraction {
        replySuccessMessage(client: CoinsClient, content: string, ephemeral: boolean): Promise<void>;

        replyErrorMessage(client: CoinsClient, content: string, ephemeral: boolean): Promise<void>;

        replyInfoMessage(client: CoinsClient, content: string, ephemeral: boolean): Promise<void>;

        editSuccessMessage(client: CoinsClient, content: string): any;

        editErrorMessage(client: CoinsClient, content: string): any;
    }

    interface AutocompleteInteraction {
        replySuccessMessage(client: CoinsClient, content: string, ephemeral: boolean): Promise<void>;

        replyErrorMessage(client: CoinsClient, content: string, ephemeral: boolean): Promise<void>;

        replyInfoMessage(client: CoinsClient, content: string, ephemeral: boolean): Promise<void>;

        editSuccessMessage(client: CoinsClient, content: string): any;

        editErrorMessage(client: CoinsClient, content: string): any;
    }

    interface ButtonInteraction {
        replySuccessMessage(client: CoinsClient, content: string, ephemeral: boolean): Promise<void>;

        replyErrorMessage(client: CoinsClient, content: string, ephemeral: boolean): Promise<void>;

        replyInfoMessage(client: CoinsClient, content: string, ephemeral: boolean): Promise<void>;

        editSuccessMessage(client: CoinsClient, content: string): any;

        editErrorMessage(client: CoinsClient, content: string): any;
    }

    interface SelectMenuInteraction {
        replySuccessMessage(client: CoinsClient, content: string, ephemeral: boolean): Promise<void>;

        replyErrorMessage(client: CoinsClient, content: string, ephemeral: boolean): Promise<void>;

        replyInfoMessage(client: CoinsClient, content: string, ephemeral: boolean): Promise<void>;

        editSuccessMessage(client: CoinsClient, content: string): any;

        editErrorMessage(client: CoinsClient, content: string): any;
    }

    interface ModalSubmitInteraction {
        replySuccessMessage(client: CoinsClient, content: string, ephemeral: boolean): Promise<void>;

        replyErrorMessage(client: CoinsClient, content: string, ephemeral: boolean): Promise<void>;

        replyInfoMessage(client: CoinsClient, content: string, ephemeral: boolean): Promise<void>;

        editSuccessMessage(client: CoinsClient, content: string): any;

        editErrorMessage(client: CoinsClient, content: string): any;
    }
}

CommandInteraction.prototype.replySuccessMessage = async function (client: CoinsClient, content: string, ephemeral: boolean) {
    await this.reply({ content: `${client.getEmoji(EMOJIS.succes)} | ${content}`, ephemeral: ephemeral });
};
CommandInteraction.prototype.replyErrorMessage = async function (client: CoinsClient, content: string, ephemeral: boolean) {
    await this.reply({ content: `${client.getEmoji(EMOJIS.error)} | ${content}`, ephemeral: ephemeral });
};
CommandInteraction.prototype.replyInfoMessage = async function (client: CoinsClient, content: string, ephemeral: boolean) {
    await this.reply({ content: `${client.getEmoji(EMOJIS.information)} | ${content}`, ephemeral: ephemeral });
};
CommandInteraction.prototype.editSuccessMessage = async function (client: CoinsClient, content: string) {
    await this.editReply({ content: `${client.getEmoji(EMOJIS.succes)} | ${content}` });
};
CommandInteraction.prototype.editErrorMessage = function (client: CoinsClient, content: string) {
    return this.editReply({ content: `${client.getEmoji(EMOJIS.succes)} | ${content}` });
};

ButtonInteraction.prototype.replySuccessMessage = async function (client: CoinsClient, content: string, ephemeral: boolean) {
    await this.reply({ content: `${client.getEmoji(EMOJIS.succes)} | ${content}`, ephemeral: ephemeral });
};
ButtonInteraction.prototype.replyErrorMessage = async function (client: CoinsClient, content: string, ephemeral: boolean) {
    await this.reply({ content: `${client.getEmoji(EMOJIS.error)} | ${content}`, ephemeral: ephemeral });
};
ButtonInteraction.prototype.replyInfoMessage = async function (client: CoinsClient, content: string, ephemeral: boolean) {
    await this.reply({ content: `${client.getEmoji(EMOJIS.information)} | ${content}`, ephemeral: ephemeral });
};
ButtonInteraction.prototype.editSuccessMessage = async function (client: CoinsClient, content: string) {
    await this.editReply({ content: `${client.getEmoji(EMOJIS.succes)} | ${content}` });
};
ButtonInteraction.prototype.editErrorMessage = async function (client: CoinsClient, content: string) {
    await this.editReply({ content: `${client.getEmoji(EMOJIS.succes)} | ${content}` });
};

SelectMenuInteraction.prototype.replySuccessMessage = async function (client: CoinsClient, content: string, ephemeral: boolean) {
    await this.reply({ content: `${client.getEmoji(EMOJIS.succes)} | ${content}`, ephemeral: ephemeral });
};
SelectMenuInteraction.prototype.replyErrorMessage = async function (client: CoinsClient, content: string, ephemeral: boolean) {
    await this.reply({ content: `${client.getEmoji(EMOJIS.error)} | ${content}`, ephemeral: ephemeral });
};
SelectMenuInteraction.prototype.replyInfoMessage = async function (client: CoinsClient, content: string, ephemeral: boolean) {
    await this.reply({ content: `${client.getEmoji(EMOJIS.information)} | ${content}`, ephemeral: ephemeral });
};
SelectMenuInteraction.prototype.editSuccessMessage = async function (client: CoinsClient, content: string) {
    await this.editReply({ content: `${client.getEmoji(EMOJIS.succes)} | ${content}` });
};
SelectMenuInteraction.prototype.editErrorMessage = async function (client: CoinsClient, content: string) {
    await this.editReply({ content: `${client.getEmoji(EMOJIS.succes)} | ${content}` });
};

ModalSubmitInteraction.prototype.replySuccessMessage = async function (client: CoinsClient, content: string, ephemeral: boolean) {
    await this.reply({ content: `${client.getEmoji(EMOJIS.succes)} | ${content}`, ephemeral: ephemeral });
};
ModalSubmitInteraction.prototype.replyErrorMessage = async function (client: CoinsClient, content: string, ephemeral: boolean) {
    await this.reply({ content: `${client.getEmoji(EMOJIS.error)} | ${content}`, ephemeral: ephemeral });
};
ModalSubmitInteraction.prototype.replyInfoMessage = async function (client: CoinsClient, content: string, ephemeral: boolean) {
    await this.reply({ content: `${client.getEmoji(EMOJIS.information)} | ${content}`, ephemeral: ephemeral });
};
ModalSubmitInteraction.prototype.editSuccessMessage = async function (client: CoinsClient, content: string) {
    await this.editReply({ content: `${client.getEmoji(EMOJIS.succes)} | ${content}` });
};
ModalSubmitInteraction.prototype.editErrorMessage = async function (client: CoinsClient, content: string) {
    await this.editReply({ content: `${client.getEmoji(EMOJIS.error)} | ${content}` });
};

export function getFilesRecursive(directory: string, aFiles?: string[]) {
    const files = fs.readdirSync(directory);
    aFiles = aFiles ?? [];
    files.forEach((file) => {
        const path = `${directory}/${file}`;
        if (fs.statSync(path).isDirectory()) {
            aFiles = getFilesRecursive(path, aFiles);
        } else {
            aFiles!.push(path);
        }
    })
    return aFiles;
}

export function createMissingProperties(def: object, obj: object) {
    for (let key of Object.keys(def) as Array<keyof object>) {
        if (typeof def[key] === "object" && !(<any>def[key] instanceof Date)) {
            if (obj[key] === undefined || obj[key] === null) {
                (obj[key] as object) = {};
            }
            createMissingProperties(def[key], obj[key]);
        } else if (obj[key] === undefined || obj[key] === null) {
            obj[key] = def[key];
        }
    }
    return obj;
}

export function date() {
    return new Date().toLocaleString('fr-FR', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    });
}
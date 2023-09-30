import { CoinsClient } from "../../Library";
import mongoose from "mongoose";
import chalk from "chalk";
import { find as findServer, edit as editServer, update as updateServer } from "../../Models/server";
import { readdirSync } from "fs";
import { SERVER_LIVE, SERVER_DEV } from "../../config";

const Logger = require("../../Library/logger");
const synchronizeSlashCommands = require('discord-sync-commands-v2');

export default async function (client: CoinsClient) {
    console.log(chalk.grey('--------------------------------'));
    Logger.client(`Connected as "${client.user!.tag}"`);
    Logger.client(`For ${client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b)} users, for ${client.channels.cache.size} channels, for ${client.guilds.cache.size} servers discord !`);

    client.user!.setPresence({ status: "idle", activities: [{ name: `${client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b)} membres`, type: 3 }] });

    const connectDB = await mongoose.connect(process.env.APP_DATABASE!, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
        autoIndex: false,
        poolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4
    }).then(() => {
        Logger.client(`Connected to the database`);
    }).catch(err => {
        Logger.error("Connection failed. Try reconnecting in 5 seconds...");
        setTimeout(() => connectDB, 5000);
        Logger.error(`${err}`)
    })

    mongoose.Promise = global.Promise;
    console.log(chalk.grey('--------------------------------'));

    client.guilds.cache.forEach(async (guild) => {
        const firstInvite = await guild.invites.fetch();
        client.invite.set(guild.id, new Map(firstInvite.map((invite) => [invite.code, invite.uses])));
    });

    for (const guild of client.guilds.cache.map(guild => guild)) {
        if (guild.id !== SERVER_LIVE && guild.id !== SERVER_DEV) continue;

        const serverConfig: any = await findServer(guild.id);

        await updateServer(guild.id);
        
        const categoryFolder = readdirSync('./src/Commands');
        for (const categoryName of categoryFolder) {
            let categoryDatabase = serverConfig.maintenance.category;
            const moduleAlready = categoryDatabase.find((e: any) => e.categoryName == categoryName);

            if (!moduleAlready) {
                categoryDatabase.push({ categoryName, state: false, reason: "" });
                await editServer(guild.id, serverConfig);
            }
        }

        await synchronizeSlashCommands(client, client.slashCommands.map(command => command.slash.data), {
            debug: false,
            guildId: guild.id // remove this property to use global commands
        });

        for (const command of client.slashCommands.map(command => command)) {
            const cmdDatabase = serverConfig.maintenance.commandes;
            const cmdName = command.slash.data.name;

            await guild.commands.create(command.slash.data);

            const commandAlready = cmdDatabase.find((e: any) => e.cmdName == cmdName);

            if (!commandAlready) {
                cmdDatabase.push({ cmdName, state: false, reason: "" });
                await editServer(guild.id, serverConfig);
            }
        }
    }

}
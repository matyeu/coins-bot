import { model, Schema } from "mongoose";
import { Snowflake } from "discord.js";
import { createMissingProperties } from "../Library";

const Logger = require("../Library/logger");

const Server = model(
    "Server",
    new Schema({
        serverId: String,
        administrators: Array,
        maintenance: {
            state: Boolean,
            reason: String,
            commandes: Array,
            category: Array,
        }
    })
    )

export const def = {
    serverId: "1098316625490481242",
    administrators: "916444775861850175",
    maintenance: {
        state: false,
        reason: "",
        commandes: Array,
        category: Array,
    },
};

export async function create(id: Snowflake) {
    let guild = new Server(createMissingProperties(def, { serverId: id }));
    await guild.save();
    Logger.database("Creating a server in the database");
    return guild;
}

export async function find(id: Snowflake) {
    let guild = await Server.findOne({ serverId: id });
    if (!guild) guild = await create(id);
    return guild;
}

export async function edit(id: Snowflake, data: object) {
    await find(id);
    let guild = await Server.findOneAndUpdate({ serverId: id }, data, {
        new: true,
    });
    Logger.database("Updating a server in the database");
    return await guild!.save();
}

export async function update(id: Snowflake) {
    let guild = await find(id);
    let data = createMissingProperties(def, guild);
    return edit(id, data);
}

export default Server;
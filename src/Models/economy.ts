import {model, Schema} from 'mongoose';
import {Snowflake} from "discord.js";
import {createMissingProperties} from "../Library";

const Logger = require("../Library/logger");

let Economy = model("Economy", new Schema({
    serverId: String,
    userId: String,
    money: Number,
    bank: Number,
    job: String,
    reputation: Number,
    cooldowns: {
        daily: Date,
        crime: Date,
        work: Date,
        rob: Date,
        lastRob: Date,
    }
}));

export const def = {
    serverId: "",
    userId: "",
    money: 0,
    bank: 0,
    job: "",
    reputation: 0,
    cooldowns: {
        daily: 0,
        crime: 0,
        work: 0,
        rob: 0,
        lastRob: 0,
    }
};

export async function create(serverId: Snowflake, userId: Snowflake) {
    const member = new Economy(createMissingProperties(def, {serverId, userId}));
    await member.save();
    Logger.client("Creating a user in economy in the database");
    return member;
}

export async function find(serverId: Snowflake, userId: Snowflake) {
    let member = await Economy.findOne({serverId, userId});
    if(!member) {
        member = await create(serverId, userId);
    }
    return member;
}

export async function findServer(serverId: Snowflake) {
    if (!serverId) return null;
    const members = await Economy.find({ guildID: serverId });
    if (members) return members;
    return null;
}

export async function edit(serverId: Snowflake, userId: Snowflake, data: object) {
    await find(serverId, userId);
    const member = await Economy.findOneAndUpdate({serverId, userId}, data, {new:true});
    return await member!.save();
}

export async function update(serverId: Snowflake, userId: Snowflake) {
    const member = await find(serverId, userId);
    const data = createMissingProperties(def, member)
    return edit(serverId, userId, data);
}

export default Economy;
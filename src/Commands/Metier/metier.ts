import { CoinsClient } from "../../Library";
import {ApplicationCommandOptionType, CommandInteraction, EmbedBuilder} from "discord.js";
import { find, edit } from "../../Models/economy";
import {EMBED_GENERAL, FOOTER} from "../../config";

const metiers = require("../../../assets/jsons/metiers.json");

export default async function (client: CoinsClient, interaction: CommandInteraction) {
    
    const economyConfig: any = await find(interaction.guild!.id, interaction.user.id);
    const jobOption: any = interaction.options.get('metier', false);
    
    if (jobOption) {
        
        const position = metiers.map((e: { name: string; }) => e.name.toLowerCase()).indexOf(jobOption.value?.toLowerCase());
        const metier = metiers[position];
        
        if (!metier) return interaction.replyErrorMessage(client, `**Le métier \`${jobOption.value}\` éxiste pas ou est introuvable !**`, true);
        if (!metier.actived) return interaction.replyErrorMessage(client, `**Le métier \`${metier.name}\` est actuellement \`désactivé\`**`, true);
        if (metier.reputation > economyConfig.reputation)
            return interaction.replyErrorMessage(client, `**Oops, il vous manque \`${metier.reputation - economyConfig.reputation} réputation\` pour devenir un ${metier.name}**`, true);
        
        economyConfig.job = metier.name;
        economyConfig.reputation -= metier.reputation;
        await edit(interaction.guild!.id, interaction.user.id, economyConfig);
        
        return interaction.replySuccessMessage(client, `**Vous êtes désormais ${metier.name}**`, true);
        
    } else {
        
        const embed = new EmbedBuilder()
        .setColor(EMBED_GENERAL)
        .setDescription(metiers.map((e: { name: string, reputation: number, description: string; }) =>
        `**${e.name}**\nPrix: ${e.reputation} :small_red_triangle:\n┖${e.description}`).join('\n\n'))
        .setTimestamp()
        .setFooter({ text: FOOTER, iconURL: client.user?.displayAvatarURL() });
        
        return interaction.reply({embeds: [embed]});
    }
}

export const slash = {
    data: {
        name: __filename.slice(__dirname.length + 1, __filename.length - 3),
        description: "Allows you to purchase a profession.",
        usage: "metier [metier]",
        category: "Metier",
        permissions: ["SendMessages"],
        options: [
            {
                name: "metier",
                type: ApplicationCommandOptionType.String,
                description: "Nom du métier souhaité."
            }

        ],
    }
}
import {CoinsClient} from "../../Library";
import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction
} from "discord.js";
import {find} from "../../Models/economy";
import { EMOJIS } from "../../config";

let amountCache: Number;

export default async function (client: CoinsClient, interaction: CommandInteraction) {
    
    const amountOption = interaction.options.get('montant', true).value as number;
    amountCache = amountOption;
    
    const memberOption: any = interaction.options.get("utilisateur", true).value;
    const member = await interaction.guild!.members.fetch(memberOption);
    
    const authorConfig : any = await find(interaction.guild!.id, interaction.user!.id);
    const userConfig: any = await find(interaction.guild!.id, member.id);
    
    const coinEmoji = client.getEmoji(EMOJIS.coin);
    
    if (interaction.user.id === member.id) return interaction.replyErrorMessage(client, "**Impossible de vous mentionnez pour cette commande.**", true);
    if (authorConfig.money < amountOption)
        return interaction.replyErrorMessage(client, `**Oops, il vous manque \`${amountOption - authorConfig.money}\`${coinEmoji} pour valider ce gun fight !**`, true);
    if (userConfig.money < amountOption)
        return interaction.replyErrorMessage(client, `**Oops, il manque \`${amountOption - userConfig.money}\`${coinEmoji} à ${member} pour valider ce gun fight !**`, true);
    
   await interaction.reply({content: `**⚔️ | La demande de gunfight a été envoyée avec succès.**`, ephemeral: true});
    
    const buttons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`acceptGun-button:${interaction.user.id}-${member.id}`)
                .setLabel("Oui")
                .setStyle(ButtonStyle.Primary)
                )
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`refusedGun-button:${interaction.user.id}-${member.id}`)
                .setLabel("Non")
                .setStyle(ButtonStyle.Danger)
                )
    
    const button = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`timeout-button`)
                .setLabel("Fin du temps imparti pour cet interaction.")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
                )
    
    await interaction.channel!.send({
        content: `**⚔️ | ${member}, ${interaction.user}, vous demande en duel pour la somme de ${amountOption} ${coinEmoji}, acceptez-vous ?\nTemps de réponse : 30 secondes**`,
        components: [buttons]
    }).then(message => {setTimeout(async () => {
        try {
            await message.edit({components: [button]})
        }
        catch(err: any) {
            if (err.message.match("Unknown Message")) return;
            
            console.error(err);
        }
    }, 30000)});
}

export function getAmountCache() {
    return amountCache;
}

export const slash = {
    data: {
        name: __filename.slice(__dirname.length + 1, __filename.length - 3),
        description: "Permet de jouer au gunfight.",
        usage: "gunfight <montant> <utilisateur>",
        category: "Casino",
        permissions: ["SendMessages"],
        options: [
            {
                name: "montant",
                type: ApplicationCommandOptionType.Number,
                description: "La somme d'argent que vous voulez pariez.",
                required: true,
            },
            {
                name: "utilisateur",
                type: ApplicationCommandOptionType.User,
                description: "Mention de l'utilisateur",
                required: true,
            }
        ],
    }
}

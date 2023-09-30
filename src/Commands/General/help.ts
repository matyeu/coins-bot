import { CoinsClient } from "../../Library";
import { ActionRowBuilder, CommandInteraction, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { EMBED_GENERAL, EMOJIS, FOOTER } from "../../config";

export default async function (client: CoinsClient, interaction: CommandInteraction) {

    const embed = new EmbedBuilder()
    .setColor(EMBED_GENERAL)
    .setTitle("❓ Obtenir de l'aide")
    .setDescription(`Vous avez besoin d'informations ? Vous êtes au bon endroit !\nConsulte la liste des sujets pour en savoir plus sur ${client.user?.username}`)
    .setTimestamp()
    .setFooter({text: FOOTER, iconURL: interaction.client.user?.displayAvatarURL()})

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("help-select")
            .setPlaceholder("Sélectionner un sujet")
            .addOptions([
                {
                    label: "Commande staff",
                    description: "Avoir la liste des commandes staff",
                    emoji: EMOJIS.development,
                    value: "staff",
                },
                {
                    label: "Commande générale",
                    description: "Avoir la liste des commandes générales",
                    emoji: EMOJIS.command,
                    value: "general",
                },
                {
                    label: "Gestion & commandes des coins",
                    description: "Avoir la liste et les informations des commandes",
                    emoji: EMOJIS.coin,
                    value: "coin",
                }
            ])
            );

    return interaction.reply({embeds: [embed], components: [row]})
}

export const slash = {
    data: {
        name: __filename.slice(__dirname.length + 1, __filename.length - 3),
        description: "Command help",
        category: "Général",
        permissions: ["SendMessages"],
    }
}
import { CoinsClient } from "../../Library";
import { ApplicationCommandOptionType, ActionRowBuilder, CommandInteraction, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import {EMBED_GENERAL, EMBED_INFO, EMOJIS, FOOTER} from "../../config";

export default async function (client: CoinsClient, interaction: CommandInteraction) {

    const commandOption: any = interaction.options.get("commande", false);

    if (!commandOption) {

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
    } else {

        const commandArray = client.slashCommands.map(command => command.slash.data);
        const commandeInfo = commandArray.filter((command) => command.name === commandOption.value.toLowerCase());

        const embed = new EmbedBuilder()
         .setColor(EMBED_INFO)
        .setAuthor({name: `Page d'aide de la commande ${commandeInfo.map((cmd) => `${cmd.name}`)}`, iconURL: "https://media.discordapp.net/attachments/851876715835293736/852647593020620877/746614051601252373.png"})
        .setDescription(`**\`[]\` : paramètre facultatif
\`<>\` : paramètre obligatoire
\`<thing 1 | thing2>\` : sélectionnez l'une de ces options**

**Commande** - [ \`${commandeInfo.map((cmd) => `${cmd.name}`)}\` ]

**Description** - [ \`${commandeInfo.map((cmd) => `${cmd.description}`)}\` ]

**Usage** - [ \`${commandeInfo.map((cmd) => `${cmd.usage ? cmd.usage : "`Pas d'utilisation conseillée`"}`)}\` ] `)
         .setTimestamp()
         .setFooter({text: FOOTER, iconURL: interaction.client.user?.displayAvatarURL()})


        return interaction.reply({embeds: [embed]})
    }
}

export const slash = {
    data: {
        name: __filename.slice(__dirname.length + 1, __filename.length - 3),
        description: "Command help",
        usage: "help [command]",
        category: "Général",
        permissions: ["SendMessages"],
        options: [
            {
                name: "commande",
                type: ApplicationCommandOptionType.String,
                description: "Mention ou ID de l'utilisateur."
            }

        ],
    }
}
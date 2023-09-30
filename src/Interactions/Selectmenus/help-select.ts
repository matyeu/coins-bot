import {EmbedBuilder, SelectMenuInteraction } from "discord.js";
import { EMBED_GENERAL, EMOJIS, FOOTER } from "../../config";
import { CoinsClient } from "../../Library";
import {readdirSync} from "fs";

export default async function (client: CoinsClient, interaction: SelectMenuInteraction) {

    const embedHead = new EmbedBuilder()
    .setColor(EMBED_GENERAL)
    .setTitle("❓ Obtenir de l'aide")
    .setDescription(`Vous avez besoin d'informations ? Vous êtes au bon endroit !\nConsulte la liste des sujets pour en savoir plus sur ${client.user?.username}`)
    
const embed = new EmbedBuilder()
    .setColor(EMBED_GENERAL)
    .setTimestamp()
    .setFooter({text: FOOTER, iconURL: interaction.client.user?.displayAvatarURL()})

    await interaction.update({content: null}).then(() => {
        const commandFolder = readdirSync('./src/Commands');

        switch (interaction.values[0]) {
            case 'staff':
                embed.setTitle(`${client.getEmoji(EMOJIS.development)} La liste des commandes ${client.getEmoji(EMOJIS.development)}`);
                for (const category of commandFolder) {
                    if (category !== "Administration" && category !== "Modération") continue;

                    const emojisCat = {
                        Administration: client.getEmoji(EMOJIS.admin),
                        Mod\u00e9ration: client.getEmoji(EMOJIS.discordemployee)
                    }

                    embed.addFields({
                        name: `${emojisCat[category]} ${category} - (${client.slashCommands.filter(cmd => cmd.slash.data.category == category).map(cmd => cmd.slash.data.name).length})`,
                        value: `\`${client.slashCommands.filter(cmd => cmd.slash.data.category == category).map(cmd => cmd.slash.data.name).join(',')}\``
                    })
                }
                break;
            case 'general':
                embed.setTitle(`${client.getEmoji(EMOJIS.command)} La liste des commandes ${client.getEmoji(EMOJIS.command)}`);
                for (const category of commandFolder) {
                    if (category !== "Général") continue;

                    const emojisCat = {
                        G\u00e9n\u00e9ral: client.getEmoji(EMOJIS.general),
                    }

                    embed.addFields({
                        name: `${emojisCat[category]} ${category} - (${client.slashCommands.filter(cmd => cmd.slash.data.category == category).map(cmd => cmd.slash.data.name).length})`,
                        value: `\`${client.slashCommands.filter(cmd => cmd.slash.data.category == category).map(cmd => cmd.slash.data.name).join(',')}\``
                    })
                }
                break;
                case 'coin':
                    embed.setTitle(`${client.getEmoji(EMOJIS.coin)} Gestion & commandes des coins ${client.getEmoji(EMOJIS.coin)}`)
                    embed.setDescription("> 🗨️ Vous gagnez `5 coins` à tous les messages envoyés\n> 🔊 Vous gagnez `300 coins` toutes les 15 minutes lorsque vous êtes en vocal\n> 🎥 Vous gagnez `400 coins` lorsque vous êtes en stream\n> 📹 Vous gagnez `500 coins` lorqque vous activez votre caméra !")

                 for (const category of commandFolder) {
                     if (category !== "Economie") continue;

                     embed.addFields({
                         name: `La liste des commandes - (${client.slashCommands.filter(cmd => cmd.slash.data.category == category).map(cmd => cmd.slash.data.name).length})`,
                         value: `\`${client.slashCommands.filter(cmd => cmd.slash.data.category == category).map(cmd => cmd.slash.data.name).join(',')}\``
                     })
                 }
                    break;
            default:
                return interaction.editErrorMessage(client, `Le topic ${interaction.values[0]} **n'existe pas**.`)
        }
    });
    return interaction.editReply({embeds: [embedHead, embed]});
}

export const select = {
    data: {
        name: __filename.slice(__dirname.length + 1, __filename.length - 3)
    }
}
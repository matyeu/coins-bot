import { CoinsClient } from "../../Library";
import {
    ActionRowBuilder,
    ApplicationCommandOptionType, AttachmentBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CommandInteraction, EmbedBuilder
} from "discord.js";
import { find, edit } from "../../Models/economy";
import { EMBED_GENERAL, EMOJIS, IDLE_BUTTON } from "../../config";

const Logger = require("../../Library/logger");

export default async function (client: CoinsClient, interaction: CommandInteraction) {

    const amountOption = interaction.options.get('montant', true).value as number;

    const memberOption: any = interaction.options.get("utilisateur", true).value;

    const member1 = await interaction.guild!.members.fetch(interaction.user.id);
    const member2 = await interaction.guild!.members.fetch(memberOption);

    const authorConfig: any = await find(interaction.guild!.id, member1.id);
    const userConfig: any = await find(interaction.guild!.id, member2.id);

    const coinEmoji = client.getEmoji(EMOJIS.coin);

    if (interaction.user.id === member2.id) return interaction.replyErrorMessage(client, "**Impossible de vous mentionnez pour cette commande.**", true);
    if (authorConfig.money < amountOption)
        return interaction.replyErrorMessage(client, `**Oops, il vous manque \`${amountOption - authorConfig.money}\`${coinEmoji} pour valider ce pierre feuille ciseaux !**`, true);
    if (userConfig.money < amountOption)
        return interaction.replyErrorMessage(client, `**Oops, il manque \`${amountOption - userConfig.money}\`${coinEmoji} à ${member2} pour valider ce pierre feuille ciseaux !**`, true);

    await interaction.reply({ content: `**⚔️ | La demande de pierre feuille ciseaux a été envoyée avec succès.**`, ephemeral: true });

    const buttons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`acceptPfc-button`)
                .setLabel("Oui")
                .setStyle(ButtonStyle.Primary)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`refusedPfc-button`)
                .setLabel("Non")
                .setStyle(ButtonStyle.Danger)
        )

    const replyMessage = await interaction.channel!.send({
        content: `**⚔️ | ${member2}, ${member1}, vous demande en duel pour la somme de ${amountOption} ${coinEmoji}, acceptez-vous ?\nTemps de réponse : 30 secondes**`,
        components: [buttons]
    });

    const collector = replyMessage.createMessageComponentCollector({ filter: () => true, idle: IDLE_BUTTON });

    collector.on('collect', async (inter: ButtonInteraction) => {
        Logger.button(`The ${inter.customId} button was used by ${inter.user?.tag} on the ${inter.guild?.name} server.`);

        if (inter.user.id !== member2.id)
            return inter.replyErrorMessage(client, `**Vous n'avez pas l'habilitation d'utiliser cet interaction !**`, true);

        switch (inter.customId) {
            case 'acceptPfc-button':
                const attachment = new AttachmentBuilder('./assets/pictures/examplePfc.png', { name: 'examplePfc.png' });

                const embed = new EmbedBuilder()
                    .setColor(EMBED_GENERAL)
                    .setTitle(`Pierre feuille ciseau entre ${member1.displayName} et ${member2.displayName}`)
                    .addFields({ name: "Objectif", value: "Choisir le bon objet pour battre l'adversaire !\n__Exemple:__" })
                    .setImage("attachment://examplePfc.png")
                    .setFooter({ text: "5 secondes avant le début" })

                const replyUpdate = await inter.update({ content: `**⚔️ | ${member2}, a accepté la demande de pierre feuille ciseaux de ${member1} !**`, components: [] });
                const replyInteraction = await inter.followUp({ embeds: [embed], files: [attachment] });

                let timeLeft = 5;
                let timeLeftFight = 3;

                const buttons = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`rock-button:${member1.id}-${member2.id}`)
                            .setLabel(`Pierre`)
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`leaf-button:${member1.id}-${member2.id}`)
                            .setLabel(`Feuille`)
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`scissors-button:${member1.id}-${member2.id}`)
                            .setLabel(`Ciseaux`)
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true)
                    )
                const updateTimer = async () => {
                    if (timeLeft === 0) {
                        await replyUpdate.delete();
                        await replyInteraction.delete();

                        let content = ":right_fist:      **Pierre**        :left_fist:";
                        const replyMessageGame = await inter.channel!.send({ content: content, embeds: [], files: [], components: [buttons] });
                        const collectorGame = replyMessageGame.createMessageComponentCollector({ filter: () => true, idle: 10000 });

                        let chooseMember1 = "";
                        let chooseMember2 = "";
                        let messageSent = false;
                        const updateTimerPfc = () => {
                            if (timeLeftFight === 3) {
                                timeLeftFight--;
                                setTimeout(updateTimerPfc, 1000);
                            } else if (timeLeftFight === 2) {
                                content = ":right_fist:      **Feuille**        :left_fist:";
                                timeLeftFight--;
                                setTimeout(updateTimerPfc, 1000);
                            } else if (timeLeftFight === 1) {
                                content = ":right_fist:      **Ciseaux**        :left_fist:";
                                timeLeftFight--;
                                setTimeout(updateTimerPfc, 1000);
                            }
                            else {
                                content = ":right_fist:      **CHOISISSEZ !**        :left_fist:"
                                buttons.components[0].setDisabled(false);
                                buttons.components[1].setDisabled(false);
                                buttons.components[2].setDisabled(false);

                                collectorGame.on('collect', async (interGame: ButtonInteraction) => {
                                    Logger.button(`The ${interGame.customId} button was used by ${interGame.user?.tag} on the ${interGame.guild?.name} server.`);

                                    const firstSplit = interGame.customId.split('-')[1]
                                    const secondFlit = firstSplit.split(":")[1];

                                    if (interGame.customId.split('-')[2] !== interGame.user.id && secondFlit !== interGame.user.id)
                                        return interGame.replyErrorMessage(client, `**Vous n'avez pas l'habilitation d'utiliser cet interaction !**`, true);

                                    switch (interGame.customId.split(':')[0]) {
                                        case 'rock-button':
                                            if (interGame.user.id === member1.id) chooseMember1 = "pierre";
                                            if (interGame.user.id === member2.id) chooseMember2 = "pierre";

                                            await interGame.replySuccessMessage(client, "**L'objet pierre a été sélectioné**", true);

                                            break;
                                        case 'leaf-button':
                                            if (interGame.user.id === member1.id) chooseMember1 = "feuille";
                                            if (interGame.user.id === member2.id) chooseMember2 = "feuille";

                                            await interGame.replySuccessMessage(client, "**L'objet feuille a été sélectioné**", true);

                                            break;
                                        case 'scissors-button':
                                            if (interGame.user.id === member1.id) chooseMember1 = "ciseaux";
                                            if (interGame.user.id === member2.id) chooseMember2 = "ciseaux";

                                            await interGame.replySuccessMessage(client, "**L'objet ciseaux a été sélectioné**", true);

                                            break;
                                        default: return interGame.replyErrorMessage(client, "**Le bouton n'a pas été trouver par le client !**", true);
                                    }

                                    collectorGame.on('end', async _ => {
                                        if (messageSent) return;

                                        if (chooseMember1 === chooseMember2) {
                                            messageSent = true;
                                            interGame.channel!.send({ content: `> **Égalité**\nVous avez tous les deux choisi **${chooseMember1}**` });
                                        } else if (chooseMember1 === "pierre" && chooseMember2 === "ciseaux" || chooseMember1 === "feuille" && chooseMember2 === "pierre"
                                            || chooseMember1 === "ciseaux" && chooseMember2 === "feuille") {
                                            messageSent = true;

                                            authorConfig.money += amountOption;
                                            userConfig.money -= amountOption;

                                            await edit(interGame.guild!.id, member1.id, authorConfig);
                                            await edit(interGame.guild!.id, member2.id, userConfig);

                                            interGame.channel!.send({ content: `> **Victoire de ${member1} **\nIl a choisi **${chooseMember1}** et ${member2} **${chooseMember2} !**` });
                                        } else if (chooseMember2 === "pierre" && chooseMember1 === "ciseaux" || chooseMember2 === "feuille" && chooseMember1 === "pierre"
                                            || chooseMember2 === "ciseaux" && chooseMember1 === "feuille") {
                                            messageSent = true;

                                            authorConfig.money -= amountOption;
                                            userConfig.money += amountOption;

                                            await edit(interGame.guild!.id, member1.id, authorConfig);
                                            await edit(interGame.guild!.id, member2.id, userConfig);

                                            interGame.channel!.send({ content: `> **Victoire de ${member2} **\nIl a choisi **${chooseMember2}** et ${member1} **${chooseMember1} !**` });
                                        } else {
                                            messageSent = true;
                                            interGame.channel!.send({ content: `**${client.getEmoji(EMOJIS.error)} | L'un des deux joueurs n'a pas joué !** ***Vous avez été remboursé !***` });
                                        }

                                    });
                                });
                            }

                            replyMessageGame.edit({ content: content, components: [buttons] })
                        }

                        updateTimerPfc();


                    } else {
                        timeLeft--;
                        setTimeout(updateTimer, 1000);
                    }

                }

                updateTimer();

                break;
            case 'refusedPfc-button':
                await inter.update({ content: `**⚔️ | ${member2}, a refusé le pierre feuille ciseaux de ${member1} !**`, components: [] });
                break;
            default: return inter.replyErrorMessage(client, "**Le bouton n'a pas été trouver par le client !**", true);
        }

    });

    collector.on('end', async _ => {
        try {
            const button = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`timeout-button`)
                        .setLabel("Fin du temps imparti pour cet interaction.")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                )

            await replyMessage.edit({ components: [button] });
        }
        catch (err: any) {
            if (err.message.match("Unknown Message")) return;

            console.error(err);
        }
    });
}

export const slash = {
    data: {
        name: __filename.slice(__dirname.length + 1, __filename.length - 3),
        description: "Permet de jouer à pierre feuille ciseaux.",
        usage: "pfc <montant> <utilisateur>",
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

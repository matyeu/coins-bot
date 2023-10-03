import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, EmbedBuilder } from "discord.js";
import { EMBED_ERROR, EMBED_GENERAL, EMBED_SUCCESS, EMOJIS, FOOTER_CASINO, IDLE_BUTTON } from "../../config";
import { CoinsClient } from "../../Library";
import { find } from "../../Models/economy";

export default async function (client: CoinsClient, interaction: CommandInteraction) {

    const casinoConfig: any = await find(interaction.guild!.id, interaction.user.id);
    const bet = interaction.options.get('montant', true).value as number;
    const member = await interaction.guild!.members.fetch(interaction.user.id);

    const coinEmoji = client.getEmoji(EMOJIS.coin);

    const userFirst = blackjackHelper();
    const userSecond = blackjackHelper();
    let userHand = userFirst.shape + userFirst.number + userSecond.shape + userSecond.number;
    const userArray = [userSecond.number, userFirst.number];
    let userSum = blackjackSum(userArray);

    const botFirst = blackjackHelper();
    let botHand = botFirst.shape + botFirst.number;
    const botArray = [botFirst.number];
    let botSum = blackjackSum(botArray);
    let hasHit = false;

    if (casinoConfig.money < bet || bet === 0)
        return interaction.replyErrorMessage(client, `**Oops, il vous manque \`${bet - casinoConfig.money}\`${coinEmoji} !**`, true);

    if (bet < 50)
        return interaction.replyErrorMessage(client, `**Oops, vous devez** miser à montant supérieur à **50** ${coinEmoji} !`, true);

    if (bet > 500)
        return interaction.replyErrorMessage(client, `**Oops, vous pouvez** miser jusqu'à **500** ${coinEmoji} pièces !`, true);


    const embed = new EmbedBuilder()
        .setColor(EMBED_GENERAL)
        .setDescription(`**${member.displayName}#${member.user.discriminator}** votre parie est de **${bet}** ${client.getEmoji(EMOJIS.money)}\n\n**Croupier :** ${botHand} (Total: ${botSum})\n**${member.displayName} :** ${userHand} (Total: ${userSum})`)
        .setTimestamp()
        .setFooter({ text: FOOTER_CASINO, iconURL: client.user?.displayAvatarURL() });

    const buttons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`hit:${interaction.user.id}`)
                .setLabel("HIT")
                .setStyle(ButtonStyle.Success))
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`stand:${interaction.user.id}`)
                .setLabel("STAND")
                .setStyle(ButtonStyle.Primary))
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`double_down:${interaction.user.id}`)
                .setLabel("DOUBLE DOWN")
                .setStyle(ButtonStyle.Danger));

    const buttonsDisabled = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`hit:${interaction.user.id}`)
                .setLabel("HIT")
                .setDisabled(true)
                .setStyle(ButtonStyle.Success))
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`stand:${interaction.user.id}`)
                .setLabel("STAND")
                .setDisabled(true)
                .setStyle(ButtonStyle.Primary))
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`double_down:${interaction.user.id}`)
                .setLabel("DOUBLE DOWN")
                .setDisabled(true)
                .setStyle(ButtonStyle.Danger));


    const replyMessage = await interaction.reply({ embeds: [embed], components: [buttons], fetchReply: true });
    const collector = replyMessage.createMessageComponentCollector({ filter: () => true, idle: IDLE_BUTTON });

    collector.on('collect', async (inter: ButtonInteraction) => {
        if (inter.customId.split(':')[1] !== inter.user.id)
            return inter.replyErrorMessage(client, "**Vous n'avez pas l'habilitation d'utiliser cet interaction !**", true);

        switch (inter.customId.split(':')[0]) {
            case 'hit':
                const next = blackjackHelper();
                userHand = userHand + next.shape + next.number;
                userArray.push(next.number);
                userSum = blackjackSum(userArray);

                if (userSum > 21) {
                    casinoConfig.money -= bet;
                    await casinoConfig.save();

                    embed.setColor(EMBED_ERROR)
                        .setDescription(`**${member.displayName}#${member.user.discriminator}** vous venez de perdre **${bet}** ${client.getEmoji(EMOJIS.money)}\n\n**Croupier :** ${botHand} (Total: ${botSum})\n**${member.displayName} :** ${userHand} (Total: ${userSum})`);

                    await inter.update({ embeds: [embed], components: [buttonsDisabled] });
                    return collector.stop();
                } else if (userSum === 21) {
                    casinoConfig.money += bet;
                    await casinoConfig.save();

                    embed.setColor(EMBED_SUCCESS)
                        .setDescription(`**${member.displayName}#${member.user.discriminator}** votre parie est de **${bet}** ${client.getEmoji(EMOJIS.money)}\n\n**Croupier :** ${botHand} (Total: ${botSum})\n**${member.displayName} :** ${userHand} (Total: ${userSum})`);

                    await inter.update({ embeds: [embed], components: [buttonsDisabled] });
                    return collector.stop();

                }
                break;
            case 'stand':
                let secondCondition = true
                while (secondCondition) {
                    if (botSum < 17) {
                        let next = blackjackHelper();
                        botHand = botHand + next.shape + next.number;
                        botArray.push(next.number);
                        botSum = blackjackSum(botArray);
                    }
                    if (botSum > 21) {
                        casinoConfig.money += bet;
                        await casinoConfig.save();

                        embed.setColor(EMBED_SUCCESS)
                            .setDescription(`**${member.displayName}#${member.user.discriminator}** votre parie est de **${bet}** ${client.getEmoji(EMOJIS.money)}\n\n**Croupier :** ${botHand} (Total: ${botSum})\n**${member.displayName} :** ${userHand} (Total: ${userSum})`);

                        secondCondition = false;
                        await inter.update({ embeds: [embed], components: [buttonsDisabled] });
                        return collector.stop();
                    } else if (botSum === 21) {
                        casinoConfig.money -= bet;
                        await casinoConfig.save();

                        embed.setColor(EMBED_ERROR)
                            .setDescription(`**${member.displayName}#${member.user.discriminator}** vous venez de perdre **${bet}** ${client.getEmoji(EMOJIS.money)}\n\n**Croupier :** ${botHand} (Total: ${botSum})\n**${member.displayName} :** ${userHand} (Total: ${userSum})`);

                        secondCondition = false;
                        await inter.update({ embeds: [embed], components: [buttonsDisabled] });
                        return collector.stop();
                    } else if (botSum > userSum && botSum >= 17) {
                        casinoConfig.money -= bet;
                        await casinoConfig.save();

                        embed.setColor(EMBED_ERROR)
                            .setDescription(`**${member.displayName}#${member.user.discriminator}** vous venez de perdre **${bet}** ${client.getEmoji(EMOJIS.money)}\n\n**Croupier :** ${botHand} (Total: ${botSum})\n**${member.displayName} :** ${userHand} (Total: ${userSum})`);

                        secondCondition = false;
                        await inter.update({ embeds: [embed], components: [buttonsDisabled] });
                        return collector.stop();
                    } else if (botSum <= userSum && botSum >= 17) {
                        casinoConfig.money -= bet;
                        await casinoConfig.save();

                        embed.setColor(EMBED_SUCCESS)
                            .setDescription(`**${member.displayName}#${member.user.discriminator}** votre parie est de **${bet}** ${client.getEmoji(EMOJIS.money)}\n\n**Croupier :** ${botHand} (Total: ${botSum})\n**${member.displayName} :** ${userHand} (Total: ${userSum})`);

                        secondCondition = false;
                        await inter.update({ embeds: [embed], components: [buttonsDisabled] });
                        return collector.stop();
                    }
                }
                break;
            case 'double_down':
                if ((2 * bet) > casinoConfig.money) {
                    hasHit = true;
                    return inter.replyErrorMessage(client, "Vous ne **pouvez pas doubler** plus que votre solde", true);
                }

                if (!hasHit) {
                    let secondCondition = true;
                    const next = blackjackHelper();

                    userHand = userHand + next.shape + next.number;
                    userArray.push(next.number);
                    userSum = blackjackSum(userArray);

                    if (userSum > 21) {
                        casinoConfig.money -= bet;
                        await casinoConfig.save();

                        embed.setColor(EMBED_ERROR)
                            .setDescription(`**${member.displayName}#${member.user.discriminator}** vous venez de perdre **${bet}** ${client.getEmoji(EMOJIS.money)}\n\n**Croupier :** ${botHand} (Total: ${botSum})\n**${member.displayName} :** ${userHand} (Total: ${userSum})`);

                        secondCondition = false;
                        await inter.update({ embeds: [embed], components: [buttonsDisabled] });
                        return collector.stop();
                    } else if (userSum === 21) {
                        casinoConfig.money -= bet;
                        await casinoConfig.save();

                        embed.setColor(EMBED_SUCCESS)
                            .setDescription(`**${member.displayName}#${member.user.discriminator}** votre parie est de **${bet}** ${client.getEmoji(EMOJIS.money)}\n\n**Croupier :** ${botHand} (Total: ${botSum})\n**${member.displayName} :** ${userHand} (Total: ${userSum})`);

                        secondCondition = false;
                        await inter.update({ embeds: [embed], components: [buttonsDisabled] });
                        return collector.stop();
                    }

                    while (secondCondition) {
                        if (botSum < 17) {
                            let next = blackjackHelper();
                            botHand = botHand + next.shape + next.number;
                            botArray.push(next.number);
                            botSum = blackjackSum(botArray);
                        }

                        if (botSum > 21) {
                            casinoConfig.money -= bet;
                            await casinoConfig.save();
                            embed.setColor(EMBED_SUCCESS)
                                .setDescription(`**${member.displayName}#${member.user.discriminator}** votre parie est de **${bet}** ${client.getEmoji(EMOJIS.money)}\n\n**Croupier :** ${botHand} (Total: ${botSum})\n**${member.displayName} :** ${userHand} (Total: ${userSum})`);

                            secondCondition = false;
                            await inter.update({ embeds: [embed], components: [buttonsDisabled] });
                            return collector.stop();
                        } else if (botSum === 21) {
                            casinoConfig.money -= bet;
                            await casinoConfig.save();

                            embed.setColor(EMBED_ERROR)
                                .setDescription(`**${member.displayName}#${member.user.discriminator}** vous venez de perdre **${bet}** ${client.getEmoji(EMOJIS.money)}\n\n**Croupier :** ${botHand} (Total: ${botSum})\n**${member.displayName} :** ${userHand} (Total: ${userSum})`);

                            secondCondition = false;
                            await inter.update({ embeds: [embed], components: [buttonsDisabled] });
                            return collector.stop();
                        } else if (botSum > userSum && botSum >= 17) {
                            casinoConfig.money -= bet;
                            await casinoConfig.save();
                            embed.setColor(EMBED_SUCCESS)
                                .setDescription(`**${member.displayName}#${member.user.discriminator}** votre parie est de **${bet}** ${client.getEmoji(EMOJIS.money)}\n\n**Croupier :** ${botHand} (Total: ${botSum})\n**${member.displayName} :** ${userHand} (Total: ${userSum})`);

                            secondCondition = false;
                            await inter.update({ embeds: [embed], components: [buttonsDisabled] });
                            return collector.stop();
                        } else if (botSum <= userSum && botSum >= 17) {
                            casinoConfig.money -= bet;
                            await casinoConfig.save();
                            embed.setColor(EMBED_SUCCESS)
                                .setDescription(`**${member.displayName}#${member.user.discriminator}** votre parie est de **${bet}** ${client.getEmoji(EMOJIS.money)}\n\n**Croupier :** ${botHand} (Total: ${botSum})\n**${member.displayName} :** ${userHand} (Total: ${userSum})`);

                            secondCondition = false;
                            await inter.update({ embeds: [embed], components: [buttonsDisabled] });
                        }
                    };
                }
                break;
            default:
                return interaction.replyErrorMessage(client, "La valeur indiquée n'a pas été trouvée", true);
        };
    });

    collector.on('end', _ => {
        const buttonEnd = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`buttonEnd`)
                    .setDisabled(true)
                    .setLabel("Fin du temps imparti pour cet interaction.")
                    .setStyle(ButtonStyle.Secondary))

        replyMessage.edit({ components: [buttonEnd] });
    });
}

export const slash = {
    data: {
        name: "blackjack",
        description: "Permet de jouer au blackjack.",
        usage: "blackjack <montant>",
        category: "Casino",
        permissions: ["SendMessages"],
        options: [
            {
                name: "montant",
                type: ApplicationCommandOptionType.Number,
                description: "La somme d'argent que vous voulez pariez.",
                required: true,
            }
        ],
    }
}

function blackjackSum(hand: any) {
    let sum = 0;
    let counterA = 0;
    for (let i = 0; i < hand.length; i++) {
        if (hand[i] === "A") {
            sum = sum + 1;
            counterA++;
        } else if ((hand[i] === "K") || (hand[i] === "Q") || (hand[i] === "J")) {
            sum = sum + 10;
        } else {
            sum = sum + parseInt(hand[i]);
        }
    }
    if (counterA > 0) {
        for (let i = 0; i < counterA; i++) {
            if (sum <= 10) {
                sum = sum + 10;
            }
        }
    }
    return sum;

};

function blackjackHelper() {
    let shape = [':clubs:', ':hearts:', ':diamonds:', ':spades:']
    let numbers = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    let guessNumber = (Math.random() * 12).toFixed(0);
    let randomShape = (Math.random() * 3).toFixed(0);
    let returnNumber = numbers[parseFloat(guessNumber)];
    let returnShape = shape[parseFloat(randomShape)];
    return {
        number: returnNumber,
        shape: returnShape
    }

};
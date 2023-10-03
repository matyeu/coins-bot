import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CommandInteraction,
    EmbedBuilder,
    Message
} from "discord.js";
import {EMBED_ERROR, EMBED_INFO, EMBED_SUCCESS, EMOJIS, FOOTER_CASINO, IDLE_BUTTON} from "../../config";
import { CoinsClient } from "../../Library";
import { find, edit } from "../../Models/economy";

export default async function (client: CoinsClient, interaction: CommandInteraction) {

    const casinoConfig: any = await find(interaction.guild!.id, interaction.user.id);
    const bet = interaction.options.get('montant', true).value as number;
    const member = await interaction.guild!.members.fetch(interaction.user.id);

    const coinEmoji = client.getEmoji(EMOJIS.coin);

    if (casinoConfig.money < bet || bet === 0)
        return interaction.replyErrorMessage(client, `**Oops, il vous manque \`${bet - casinoConfig.money}\`${coinEmoji} !**`, true);

    if (bet < 50)
        return interaction.replyErrorMessage(client, `**Oops, vous devez** miser à montant supérieur à **50** ${coinEmoji} !`, true);

    if (bet > 500)
        return interaction.replyErrorMessage(client, `**Oops, vous pouvez** miser jusqu'à **500** ${coinEmoji} pièces !`, true);
    
    let stop: any = ((Math.random() * 6)).toFixed(1);
    stop = parseFloat(stop);
    const profit = bet;
    let newProfit: any = 0;

    const loss = bet;
    let multiplier: any = 1;

    let replyEmbed = new EmbedBuilder()
        .setColor(EMBED_INFO)
        .setTitle("Crash")
        .setDescription(`**${member.displayName}** votre parie est de **${bet}** ${client.getEmoji(EMOJIS.money)}`)
        .addFields(
            { inline: true, name: "Multiplier", value: `${multiplier}x` },
            { inline: true, name: "Profit: ", value: `${newProfit} ${client.getEmoji(EMOJIS.money)}` },
            { inline: false, name: `Comment jouer ${client.getEmoji(EMOJIS.integration)}`, value: "Cliquer sur stop avant de crash" }
            )
        .setTimestamp()
        .setFooter({ text: FOOTER_CASINO, iconURL: client.user?.displayAvatarURL() });

    const button = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`stop:${interaction.user.id}`)
                .setLabel("STOP")
                .setStyle(ButtonStyle.Danger))

    const buttonDisabled = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("stop")
                .setLabel("STOP")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true))

    await interaction.reply({ embeds: [replyEmbed], components: [button], fetchReply: true })
        .then((crashMessage: Message) => {
            const refreshID = setInterval(() => {
                multiplier = (multiplier + 0.2).toFixed(1);
                multiplier = parseFloat(multiplier);
                newProfit = (multiplier * profit).toFixed(0);
                newProfit = parseFloat(newProfit) - profit;

                replyEmbed = new EmbedBuilder()
                    .setColor(EMBED_SUCCESS)
                    .setTitle("Crash")
                    .setDescription(`**${member.displayName}** votre parie est de **${bet}** ${client.getEmoji(EMOJIS.money)}`)
                    .addFields(
                        { inline: true, name: "Multiplier", value: `${multiplier}x` },
                        { inline: true, name: "Profit: ", value: `${newProfit} ${client.getEmoji(EMOJIS.money)}` },
                        { inline: false, name: `Comment jouer ${client.getEmoji(EMOJIS.integration)}`, value: "Cliquer sur stop avant de crash" }
                        )
                    .setTimestamp()
                    .setFooter({ text: FOOTER_CASINO, iconURL: client.user?.displayAvatarURL() });
                crashMessage.edit({
                    embeds: [replyEmbed]
                });
                if (multiplier >= stop) {
                    clearInterval(refreshID);
                    replyEmbed = new EmbedBuilder()
                        .setColor(EMBED_ERROR)
                        .setTitle("Crash")
                        .setDescription(`**${member.displayName}** vous venez de perdre **${bet}** ${client.getEmoji(EMOJIS.money)}\nRetenter votre chance en relancant la commande </crash:1158781761795407964>`)
                        .addFields(
                            { inline: true, name: "Multiplier", value: `${multiplier}x` },
                            { inline: true, name: "Profit: ", value: `${newProfit} ${client.getEmoji(EMOJIS.money)}` },
                            { inline: false, name: `Comment jouer ${client.getEmoji(EMOJIS.integration)}`, value: "Cliquer sur stop avant de crash" }
                            )
                        .setTimestamp()
                        .setFooter({ text: FOOTER_CASINO, iconURL: client.user?.displayAvatarURL() });
                    crashMessage.edit({
                        embeds: [replyEmbed],
                        components: [buttonDisabled]
                    });

                    casinoConfig.money -= loss;
                    edit(interaction.guild!.id, interaction.user.id, casinoConfig);
                }

            }, 2000);

            const collector = crashMessage.createMessageComponentCollector({ filter: () => true, idle: IDLE_BUTTON });

            collector.on('collect', async (inter: ButtonInteraction) => {
                if (inter.customId.split(':')[1] !== inter.user.id)
                    return inter.replyErrorMessage(client, "**Vous n'avez pas l'habilitation d'utiliser cet interaction !**", true);

                clearInterval(refreshID);
                replyEmbed = new EmbedBuilder()
                    .setColor(EMBED_SUCCESS)
                    .setTitle("Crash")
                    .setDescription(`**${member.displayName}** votre parie est de **${bet}** ${client.getEmoji(EMOJIS.money)}`)
                    .addFields(
                        { inline: true, name: "Multiplier", value: `${multiplier}x` },
                        { inline: true, name: "Profit: ", value: `${newProfit} ${client.getEmoji(EMOJIS.money)}` },
                        { inline: false, name: `Comment jouer ${client.getEmoji(EMOJIS.integration)}`, value: "Cliquer sur stop avant de crash" }
                        )
                await inter.update({
                    embeds: [replyEmbed],
                    components: [buttonDisabled]
                });

                casinoConfig.money += newProfit;
                await edit(interaction.guild!.id, interaction.user.id, casinoConfig);
                return collector.stop();
            });
        });


    
}

export const slash = {
    data: {
        name: __filename.slice(__dirname.length + 1, __filename.length - 3),
        description: "Permet de jouer à crash.",
        usage: "crash <montant>",
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
import {CoinsClient} from "../../Library";
import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ButtonBuilder, ButtonInteraction, ButtonStyle,
    CommandInteraction,
    EmbedBuilder
} from "discord.js";
import {find, edit} from "../../Models/economy";
import {EMBED_ERROR, EMBED_GENERAL, EMBED_SUCCESS, EMOJIS, FOOTER_CASINO, IDLE_BUTTON} from "../../config";

export default async function (client: CoinsClient, interaction: CommandInteraction) {
    
    const casinoConfig: any = await find(interaction.guild!.id, interaction.user.id);
    const amountOption = interaction.options.get('montant', true).value as number;
    
    const member = await interaction.guild!.members.fetch(interaction.user.id);
    
    const coinEmoji = client.getEmoji(EMOJIS.coin);

    if (casinoConfig.money < amountOption || amountOption === 0)
        return interaction.replyErrorMessage(client, `**Oops, il vous manque \`${amountOption - casinoConfig.money}\`${coinEmoji} !**`, true);
    
    if (amountOption < 50)
        return interaction.replyErrorMessage(client, `**Oops, vous devez** miser à montant supérieur à **50** ${coinEmoji} !`, true);
    
    if (amountOption > 500)
        return interaction.replyErrorMessage(client, `**Oops, vous pouvez** miser jusqu'à **500** ${coinEmoji} !`, true);
    
    const embed = new EmbedBuilder()
        .setColor(EMBED_GENERAL)
        .setDescription(`**${member.displayName}** votre parie est de **${amountOption}** ${client.getEmoji(EMOJIS.money)}\n\n✊│✊│✊\n⚫│\uD83D\uDD34│\uD83D\uDFE2`)
        .setTimestamp()
        .setFooter({ text: FOOTER_CASINO, iconURL: interaction.client.user?.displayAvatarURL() });

    const buttons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`black:${interaction.user.id}`)
                .setLabel("NOIR")
                .setStyle(ButtonStyle.Secondary))
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`red:${interaction.user.id}`)
                .setLabel("ROUGE")
                .setStyle(ButtonStyle.Danger))
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`green:${interaction.user.id}`)
                .setLabel("VERT")
                .setStyle(ButtonStyle.Success))

    const replyMessage = await interaction.reply({ embeds: [embed], components: [buttons], fetchReply: true });
    const collector = replyMessage.createMessageComponentCollector({ filter: () => true, idle: IDLE_BUTTON });

    let betCurrent = amountOption;
    let round = 2;

    collector.on("collect", async (inter: ButtonInteraction) => {

        if (inter.customId.split(':')[1] !== inter.user.id)
            return inter.replyErrorMessage(client, "**Vous n'avez pas l'habilitation d'utiliser cet interaction !**", true);

        let randomColor = 'red';
        const probability = Math.floor(Math.random() * 39);
        if (probability === 0) randomColor = 'green';
        else if (probability % 2 === 0) randomColor = 'black';
        const chooseColor = inter.customId.split(':')[0];

        if (inter.customId.split(':')[0] === 'cashout') {

            casinoConfig.money += betCurrent * round;
            await edit(interaction.guild!.id, interaction.user.id, casinoConfig);

            embed.setColor(EMBED_SUCCESS)
            embed.setDescription(`**${member.displayName}** vous avez gagner **${betCurrent}** ${client.getEmoji(EMOJIS.money)}`);

            await inter.update({ embeds: [embed] });
            return collector.stop();
        } else if (chooseColor === randomColor) {
            betCurrent = randomColor === 'green' ? (amountOption * 35) : (amountOption * 2);

            embed.setDescription(`**${member.displayName}** votre parie est de **${betCurrent}** ${client.getEmoji(EMOJIS.money)}\n\n${randomColor === 'black' ? "👇" : "✊"}│${randomColor === 'red' ? "👇" : "✊"}│${randomColor === 'green' ? "👇" : "✊"}\n⚫│\uD83D\uDD34│\uD83D\uDFE2`)

            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId(`cashout:${interaction.user.id}`)
                    .setEmoji(EMOJIS.money)
                    .setLabel("CASHOUT")
                    .setStyle(ButtonStyle.Primary));

            await inter.update({ embeds: [embed], components: [buttons] });
            round++

        }
        else {
            casinoConfig.money -= betCurrent;
            await edit(interaction.guild!.id, interaction.user.id, casinoConfig);

            embed.setColor(EMBED_ERROR)
            embed.setDescription(`**${member.displayName}** vous avez perdu **${betCurrent}** ${client.getEmoji(EMOJIS.money)}\nRetenter votre chance en relancant la commande </roulette:1158474844392919160>\n\n${randomColor === 'black' ? "👇" : "✊"}│${randomColor === 'red' ? "👇" : "✊"}│${randomColor === 'green' ? "👇" : "✊"}\n⚫│\uD83D\uDD34│\uD83D\uDFE2`)

            await inter.update({ embeds: [embed], components: [] });
            return collector.stop();

        }
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
        name: __filename.slice(__dirname.length + 1, __filename.length - 3),
        description: "Permet de jouer à la roulette.",
        usage: "roulette <montant>",
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
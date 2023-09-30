import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ButtonBuilder, ButtonInteraction, ButtonStyle,
    CommandInteraction,
    EmbedBuilder, TextChannel
} from "discord.js";
import { CoinsClient } from "../../Library";
import {EMBED_GENERAL, FOOTER, IDLE_BUTTON} from "../../config";
import { find, edit } from "../../Models/economy";

const Logger = require("../../Library/logger");

export default async function (client: CoinsClient, interaction: CommandInteraction) {
    
    const amountOption = interaction.options.get('montant', true).value as number;
    const channelOption = interaction.options.get('channel', false);
    
    const channel = <TextChannel>await interaction.guild!.channels.cache.get(`${channelOption ? channelOption.value : interaction.channel!.id}`)!;
    
    await interaction.replySuccessMessage(client, `**Drop lancé dans ⁠${channel}**`, true);
    
    const embed = new EmbedBuilder()
    .setColor(EMBED_GENERAL)
    .setTitle('🎉 Un colis tombe du ciel !')
    .setDescription(`Cliques sur le boutton ci-dessous pour l'attraper et gagner \`${amountOption} coins\``)
    .setTimestamp()
    .setFooter({ text: FOOTER, iconURL: client.user?.displayAvatarURL() });
    
    const button = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`button:${interaction.user.id}`)
                .setLabel("Lancement en cours...")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)
                )
    
    
    const replyMessage = await channel.send({ embeds: [embed], components: [button] });
    const collector = replyMessage.createMessageComponentCollector({ filter: () => true, idle: IDLE_BUTTON });
    
    let timeLeft = 3;
    
    const updateTimer = () => {
        if (timeLeft === 0) {
            button.components[0].setEmoji('🏆').setLabel(`Go !`).setDisabled(false);
        } else {
            button.components[0].setLabel(`${timeLeft}`)
            timeLeft--;
            setTimeout(updateTimer, 1000);
        }

        replyMessage.edit({components: [button]})
    }
    
    updateTimer();
    
    collector.on('collect', async (inter: ButtonInteraction) => {
        Logger.button(`The ${inter.customId} button was used by ${interaction.user?.tag} on the ${interaction.guild?.name} server.`);
        if (inter.customId.split(':')[1] !== inter.user.id)
            return inter.replyErrorMessage(client, "**Vous n'avez pas l'habilitation d'utiliser cet interaction !**", true);
        
        button.components[0].setDisabled(true);
        await inter.update({ components: [button]});
        
        const economyConfig: any = await find(inter.guild!.id, inter.user.id);
        economyConfig.bank += amountOption;
        
        await edit(inter.guild!.id, inter.user.id, economyConfig);
        
        inter.channel!.send({content: `${inter.user} a attrapé le colis ! Il vient de gagner \`${amountOption} coins\``})
        return collector.stop();
      
    });
    
    collector.on('end', _ => {
        button.components[0].setLabel("Fin du temps imparti pour cet interaction.").setStyle(ButtonStyle.Secondary).setDisabled(true);
        replyMessage.edit({ components: [button]});
    })
}

export const slash = {
    data: {
        name: __filename.slice(__dirname.length + 1, __filename.length - 3),
        description: "Envois de l'argent à un autre joueur",
        usage: "drop <montant> [channel]",
        category: "Administration",
        permissions: ["Administrator"],
        options: [
            {
                name: "montant",
                type: ApplicationCommandOptionType.Number,
                description: "La somme d'argent que vous voulez drop.",
                required: true,
            },
            {
                name: "channel",
                type: ApplicationCommandOptionType.Channel,
                description: "Channel où envoyer l'embed",
                required: false,
            }
        ],
    }
}
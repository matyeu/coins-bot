import {CoinsClient} from "../../../Library";
import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonStyle,
    ButtonBuilder,
    ButtonInteraction,
    EmbedBuilder,
    GuildMember
} from "discord.js";
import {EMBED_GENERAL} from "../../../config";

export default async function (client: CoinsClient, interaction: ButtonInteraction) {
    
   if (interaction.customId.split('-')[2] !== interaction.user.id)
        return interaction.replyErrorMessage(client, `**Vous n'avez pas l'habilitation d'utiliser cet interaction !**`, true);
    
    const firstSplit = interaction.customId.split('-')[1]
    const secondFlit = firstSplit.split(":")[1];
    
    const member1 = await interaction.guild!.members.fetch(secondFlit);
    const member2 = await interaction.guild!.members.fetch(interaction.user.id);
    
    const attachment = new AttachmentBuilder('./assets/pictures/exampleGunFight.png', { name: 'exampleGunFight.png' });
    
    const embed = new EmbedBuilder()
    .setColor(EMBED_GENERAL)
    .setTitle(`Duel de gun entre ${member1.displayName} et ${member2.displayName}`)
    .addFields({name: "Objectif", value: "Être le premier à cliquer sur son bouton\n__Exemple:__"})
    .setImage("attachment://exampleGunFight.png")
    .setFooter({text: "5 secondes avant le début"})
    
    const replyUpdate = await interaction.update({content: `**⚔️ | ${member2}, a accepté la demande de gunfight de ${member1} !**`, components: []});
    const replyInteraction = await interaction.followUp({embeds: [embed], files: [attachment]});
    
    let timeLeft = 5;
    let timeLeftFight = 3;
    
    const buttons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`pullLeft-button:${member1.id}-${member2.id}`)
                .setLabel(`Tire ${member1.displayName}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
                )
           .addComponents(
               new ButtonBuilder()
                .setCustomId(`middle-button`)
                .setEmoji("⚔️")
                .setStyle(ButtonStyle.Secondary)
               .setDisabled(true)
               )
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`pullRight-button:${member1.id}-${member2.id}`)
                .setLabel(`Tire ${member2.displayName}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
                )
        const updateTimer = async () => {
        if (timeLeft === 0) {
            await replyUpdate.delete();
            await replyInteraction.delete();
            
            let content = ":levitate: :point_right:      **3**        :point_left: :levitate:";
            const replyMessage = await interaction.channel!.send({content: content, embeds: [], files: [], components: [buttons]});
            
            const updateTimerFight = () => {
                if (timeLeftFight === 0) {
                    content = ":levitate: :point_right:      **GO !**        :point_left: :levitate:"
                    buttons.components[0].setDisabled(false);
                    buttons.components[2].setDisabled(false);
                } else {
                    content = `:levitate: :point_right:      **${timeLeftFight}**        :point_left: :levitate:`
                    timeLeftFight--;
                    setTimeout(updateTimerFight, 1000);
                }

               replyMessage.edit({content: content, components: [buttons]})
            }

            updateTimerFight();
            
            
        } else {
            timeLeft--;
            setTimeout(updateTimer, 1000);
        }
        
    }

    updateTimer();
};

export const button = {
    data: {
        name: __filename.slice(__dirname.length + 1, __filename.length - 3),
    }
}
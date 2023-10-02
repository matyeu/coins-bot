import {CoinsClient} from "../../../Library";
import {ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle} from "discord.js";
import { getAmountCache } from "../../../Commands/Casino/gunfight";
import {find, edit} from "../../../Models/economy"; 

export default async function (client: CoinsClient, interaction: ButtonInteraction) {

    if (interaction.customId.split('-')[2] !== interaction.user.id)
        return interaction.replyErrorMessage(client, `**Vous n'avez pas l'habilitation d'utiliser cet interaction !**`, true);

    const firstSplit = interaction.customId.split('-')[1]
    const secondFlit = firstSplit.split(":")[1];

    const member1 = await interaction.guild!.members.fetch(interaction.customId.split('-')[2]);
    const member2 = await interaction.guild!.members.fetch(secondFlit);

    const member1Config : any = await find(interaction.guild!.id, interaction.user.id);
    const member2Config: any = await find(interaction.guild!.id, interaction.user.id === member1.id ? member2.id : member1.id);

    const buttons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`pullLeft-button`)
                .setLabel(`Tire ${member2.displayName}`)
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
                .setCustomId(`pullRight-button`)
                .setLabel(`Tire ${member1.displayName}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
                )

    const amount: any = getAmountCache()
    
    member1Config.money += amount;
    member2Config.money -= amount;

    await edit(interaction.guild!.id, interaction.user.id, member1Config);
    await edit(interaction.guild!.id, interaction.user.id === member1.id ? member2.id : member1.id, member2Config);

    await interaction.update({content: ":levitate: :skull_crossbones:     **STOP !**        :point_left: :levitate:",  components: [buttons]})
    return interaction.followUp({content: `${interaction.user} remporte ce duel !\nLa mise de \`${amount} coins\` a bien été versée sur son compte !`})

};

export const button = {
    data: {
        name: __filename.slice(__dirname.length + 1, __filename.length - 3),
    }
}
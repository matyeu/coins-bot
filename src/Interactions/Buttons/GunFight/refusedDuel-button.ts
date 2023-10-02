import {CoinsClient} from "../../../Library";
import {ButtonInteraction} from "discord.js";

export default async function (client: CoinsClient, interaction: ButtonInteraction) {
    
    if (interaction.customId.split('-')[2] !== interaction.user.id)
        return interaction.replyErrorMessage(client, `**Vous n'avez pas l'habilitation d'utiliser cet interaction !**`, true);
    
    const firstSplit = interaction.customId.split('-')[1]
    const secondFlit = firstSplit.split(":")[1];
    
    const member = await interaction.guild!.members.fetch(secondFlit);
    
    return interaction.update({content: `**⚔️ | ${interaction.user}, a refusé le gunfight de ${member} !**`, components: []});
};

export const button = {
    data: {
        name: __filename.slice(__dirname.length + 1, __filename.length - 3),
    }
}
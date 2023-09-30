import {CoinsClient} from "../../Library";
import {CommandInteraction, EmbedBuilder} from "discord.js";
import {EMBED_INFO, FOOTER, } from "../../config";

export default async function (client: CoinsClient, interaction: CommandInteraction) {

    const start = Date.now();
    interaction.reply({content: "Pong !"}).then(() => {

        const end = Date.now();
        const time = end - start;

        let botLatency = `${'```js'}\n ${Math.round(time)} ms ${'```'}`
        let apiLatency = `${'```js'}\n ${Math.round(interaction.client.ws.ping)} ms ${'```'}`

        const embed = new EmbedBuilder()
            .setColor(EMBED_INFO)
            .setTitle("🏓 | Temps de réponses")
            .addFields(
                    {name: "Latence du bot", value: botLatency, inline: true},
                    {name: "Latence de l'api", value: apiLatency, inline: true},
                    )
            .setTimestamp()
            .setFooter({text: FOOTER, iconURL: interaction.client.user?.displayAvatarURL()});

        interaction.editReply({content: null, embeds: [embed]});
    });

}

export const slash = {
    data: {
        name: __filename.slice(__dirname.length + 1, __filename.length - 3),
        description: "Affiches les latences du bot",
        category: "Development",
        permissions: ["Administrator"],
    }
}
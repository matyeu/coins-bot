import { Collection, Interaction, EmbedBuilder } from "discord.js";
import { CoinsClient } from "../../Library";
import { find as findGuild } from "../../Models/server";
import { EMBED_INFO } from "../../config";

const Logger = require("../../Library/logger");

export default async function (client: CoinsClient, interaction: Interaction) {

    const serverConfig: any = await findGuild(interaction.guild!.id);
    const administrators = serverConfig.administrators;
    const member = await interaction.guild!.members.fetch(interaction.user.id);

    if (interaction.isCommand() && interaction.inGuild()) {
        try {
            const command = client.slashCommands.get(interaction.commandName);

            if (!command) return interaction.replyErrorMessage(client, `La commande **${interaction.commandName}** n'a pas été trouver`, true);

            const commandMaintenance = serverConfig.maintenance.commandes.find((e: any) => e.cmdName == interaction.commandName);
            const categoryMaintenance = serverConfig.maintenance.category.find((e: any) => e.moduleName == command.slash.data.category);

            // START SYSTEM OF MAINTENANCE
            const embedMaintenance = new EmbedBuilder()
                .setColor(EMBED_INFO)
                .setTitle('Maintenance en cours')
                .setFooter({ text: `Merci de réessayer dans quelque minutes.\nPendant la maintenance, tous les systèmes automatisés de ${client.user!.username} restent fonctionnels.` });

            if (serverConfig.maintenance.state && administrators.indexOf(interaction.user.id) === -1) {
                embedMaintenance.setDescription(`${member.displayName}, une opération de maintenance est actuelement en cours sur ${client.user!.username}.`)
                if (serverConfig.maintenance.reason) embedMaintenance.addFields({ name: "Raison", value: serverConfig.maintenance.reason });
                return interaction.reply({ embeds: [embedMaintenance], ephemeral: true });
            } else if (commandMaintenance && commandMaintenance.state && administrators.indexOf(interaction.user.id) === -1) {
                embedMaintenance.setDescription(`${member.displayName}, une opération de maintenance est actuelement en cours sur la commande **${interaction.commandName}**.`)
                if (commandMaintenance.reason) embedMaintenance.addFields({ name: "Raison", value: commandMaintenance.reason });
                return interaction.reply({ embeds: [embedMaintenance], ephemeral: true });
            } else if (categoryMaintenance && categoryMaintenance.state && administrators.indexOf(interaction.user.id) === -1) {
                embedMaintenance.setDescription(`${member.displayName}, une opération de maintenance est actuelement en cours sur le module **${command.slash.data.category}**.`)
                if (categoryMaintenance.reason) embedMaintenance.addFields({ name: "Raison", value: categoryMaintenance.reason });
                return interaction.reply({ embeds: [embedMaintenance], ephemeral: true });
            }
            // END SYSTEM OF MAINTENANCE

            if (!member.permissions.has([command.slash.data.permissions]))
                return interaction.replyErrorMessage(client, "**Vous n'avez pas** la permission d'utiliser cette commande !", true);

            if (!client.cooldowns.has(interaction.commandName)) client.cooldowns.set(interaction.commandName, new Collection());

            const timeNow = Date.now();
            const tStamps = client.cooldowns.get(interaction.commandName);
            const cdAmount = (command.slash.data.cooldown || 10) * 1000;

            if (tStamps.has(interaction.user.id) && administrators.indexOf(interaction.user.id) === -1) {
                const cdExpirationTime = tStamps.get(interaction.user.id) + cdAmount;

                if (timeNow < cdExpirationTime) {
                    let timeLeft = (cdExpirationTime - timeNow) / 1000;

                    await interaction.replyErrorMessage(client,
                        `Merci de patienter **${timeLeft.toFixed(0)} seconde(s)** pour utiliser cette commande.`, true);
                    return Logger.warn(`The cooldown was triggered by ${interaction.user.username} on the ${interaction.commandName} command`);
                }
            }

            tStamps.set(interaction.user.id, timeNow);
            setTimeout(() => tStamps.delete(interaction.user.id), cdAmount);

            Logger.command(`The ${interaction.commandName} command was used by ${interaction.user.username} on the ${interaction.guild?.name} server`);
            await command.default(client, interaction);

        }
        catch (e) {
            return console.error(e);
        }
    } else if (interaction.isButton()) {
        try {
            const getButton = client.buttons.get(interaction.customId.split(':')[0]);
            if (!getButton) return;
            Logger.button(`The ${interaction.customId} button was used by ${interaction.user?.tag} on the ${interaction.guild?.name} server.`);
            getButton.default(client, interaction)
        }
        catch (e) {
            return console.error(e);
        }
    } else if (interaction.isStringSelectMenu()) {
        try {
            const getSelectMenu = client.selects.get(interaction.customId);
            if (!getSelectMenu) return;
            Logger.select(`The ${interaction.customId} select-menu was used by ${interaction.user.username} on the ${interaction.guild?.name} server.`);
            getSelectMenu.default(client, interaction)
        }
        catch (e) {
            return console.error(e);
        }
    } else if (interaction.isModalSubmit()) {
        try {
            const getModal = client.modals.get(interaction.customId.split(':')[0]);
            Logger.modal(`The ${interaction.customId} modal was used by ${interaction.user.tag} on the ${interaction.guild?.name} server.`);
            await getModal.default(client, interaction);
        } catch (err) {
            return Logger.error(err);
        }
    }
}
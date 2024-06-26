const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder} = require('discord.js');
const Member = require('../entity/member');
const Guild = require('../entity/guild');
const SettingGuild = require('../entity/settingGuild');

const {ComponentType} = require("discord-api-types/v10");
const {set} = require("mongoose");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('auto-release')
        .setDescription('Se libérer d\'un membre.'),
    async execute(interaction) {
        const guildDB = await Guild.getGuildById(interaction.guild.id);
        const settingGuild = await SettingGuild.getSettingGuild(guildDB);
        // Vérifie si l'utilisateur a capturé le membre
        const memberDB = await Member.getMemberDB(interaction.user.id, guildDB);

        if (memberDB === null) {
            await interaction.reply({content:`Vous n\'etes pas enregistré.`, ephemeral: true});
            return;
        }

        if (memberDB.capturedBy == null) {
            await interaction.reply({
                    content:`Vous n\'etes pas capturé.`,
                });
            return;
        }
        let coinCost = 1000;

        if (settingGuild.coinCost !== null) {
            coinCost = settingGuild.coinCost;
        }

        const embed = new EmbedBuilder()
            .setTitle('Libération d\'un membre')
            .setDescription(`Se libérer coutera ${coinCost} 🪙 \n` +
                            'Voulez-vous vous libérer ?')
            .setColor('#FF0000');

        const buttonValide = new ButtonBuilder()
            .setCustomId('valide')
            .setLabel('Valider')
            .setStyle(ButtonStyle.Success);

        const buttonCancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Annuler')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(buttonValide, buttonCancel);

        const autoReleaseMessage = await interaction.reply({ embeds: [embed], components: [row] });

        const collector = autoReleaseMessage.createMessageComponentCollector(
            {
                componentType : ComponentType.Button,
                time: 15000
            });

        collector.on('collect', async userInteract => {
            if (userInteract.user.id === interaction.user.id) {
                if (userInteract.customId === 'valide') {
                    if (memberDB.coins < coinCost) {
                        await interaction.editReply(
                            {
                                content:`Vous n\'avez pas assez de 🪙 pour vous libérer.\n` +
                                `Il vous manque ${coinCost - memberDB.coins} 🪙.`,
                                embeds: [],
                                components: []
                            });
                        return;
                    }

                    // Libère le membre
                    await Member.releaseMember(memberDB, guildDB);

                    // Envoie une réponse à l'utilisateur
                    await Member.updateCoins(memberDB, guildDB, memberDB.coins - coinCost);
                    interaction.editReply({content:`Vous avez été libéré.`, embeds: [], components: [] });
                } else if (userInteract.customId === 'cancel') {
                    interaction.editReply({content:`Vous avez annulé la libération.`, embeds: [], components: [] });
                }
            }
        });
    }
};
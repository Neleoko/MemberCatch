const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const Member = require('../entity/member');
const {getUserAvatarColor} = require("../utils/nodeVibrant");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('members')
        .setDescription('Affiche l\'inventaire complet de tout les membres '),
    async execute(interaction, client) {


        // Récupère tous les membres capturés
        const capturedMembers = await Member.find(
            {
                serveur_id: interaction.guild.id
            }
        );
        if (capturedMembers.length === 0) {
            return interaction.reply('Aucun membre capturé sur ce serveur.');
        }

        let currentIndex = 0;
        let embed = new EmbedBuilder();

        embed = await setEmbed(embed, capturedMembers[currentIndex], client, currentIndex, capturedMembers.length);

        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('⬅️')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('➡️')
                    .setStyle(ButtonStyle.Primary)
            );

        const message = await interaction.reply({ embeds: [embed], components: [actionRow], fetchReply: true });

        const filter = (interaction) => interaction.customId === 'previous' || interaction.customId === 'next';
        const collector = message.createMessageComponentCollector({ filter, time: 120000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'previous') {
                currentIndex = (currentIndex - 1 + capturedMembers.length) % capturedMembers.length;
            } else if (interaction.customId === 'next') {
                currentIndex = (currentIndex + 1) % capturedMembers.length;
            }
            embed = await setEmbed(embed, capturedMembers[currentIndex], client, currentIndex, capturedMembers.length);
            await interaction.update({ embeds: [embed], components: [actionRow] });
        });
        collector.on('end', () => {
            actionRow.components.forEach(component => component.setDisabled(true));
            message.edit({ components: [actionRow] });
        });
    },
};


async function setEmbed(embed, capturedMembers, client, currentIndex, totalMembers){
    const memberCaught = await client.users.fetch(capturedMembers.username_id);

    const dominantColor = await getUserAvatarColor(memberCaught.avatarURL({ extension: 'png', dynamic: true }));

    embed.setTitle(capturedMembers.username)
        .setDescription(`
            Niveau : ${capturedMembers.level}\n
            Pièces : ${capturedMembers.coins}🪙\n
        `)
        .setImage(capturedMembers.avatarURL)
        .setColor(dominantColor);

    if (capturedMembers.capturedBy){
        const memberWasCatch = await client.users.fetch(capturedMembers.capturedBy);
        embed.setFooter({
            text: `Capturé par : ${memberWasCatch.username} | ${currentIndex + 1}/${totalMembers}`,
            iconURL: memberWasCatch.avatarURL({ extension: 'png', dynamic: true })
        })
    }else {
        embed.setFooter({
            text: `${currentIndex + 1}/${totalMembers}`
        })
    }

    return embed;
}
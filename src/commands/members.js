const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const Member = require('../entity/member');
const {getUserAvatarColor} = require("../utils/nodeVibrant");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('members')
        .setDescription('Affiche l\'inventaire complet de tout les membres '),
    async execute(interaction, client) {


        // Récupère tous les membres capturés
        const members = await Member.find(
            {
                serveur_id: interaction.guild.id
            }
        );
        if (members.length === 0) {
            return interaction.reply('Aucun membre capturé sur ce serveur.');
        }

        let currentIndex = 0;
        let embed = new EmbedBuilder();

        embed = await setEmbed(embed, members[currentIndex], client, currentIndex, members.length);

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
                currentIndex = (currentIndex - 1 + members.length) % members.length;
            } else if (interaction.customId === 'next') {
                currentIndex = (currentIndex + 1) % members.length;
            }
            embed = await setEmbed(embed, members[currentIndex], client, currentIndex, members.length);
            await interaction.update({ embeds: [embed], components: [actionRow] });
        });
        collector.on('end', () => {
            actionRow.components.forEach(component => component.setDisabled(true));
            message.edit({ components: [actionRow] });
        });
    },
};


async function setEmbed(embed, member, client, currentIndex, totalMembers){
    const memberCaughtDS = await client.users.fetch(member.username_id);

    const dominantColor = await getUserAvatarColor(memberCaughtDS.avatarURL({ extension: 'png', dynamic: true }));

    embed.setTitle(memberCaughtDS.username)
        .addFields(
            { name: 'Niveau', value: member.level.toString() },
            { name: 'Pièces', value: `${member.coins} 🪙` }

        )
        .setImage(memberCaughtDS.avatarURL())
        .setColor(dominantColor);

    if (member.capturedBy){
        const memberWasCatchDS = await client.users.fetch(member.capturedBy);
        embed.setFooter({
            text: `Capturé par : ${memberWasCatchDS.username} | ${currentIndex + 1}/${totalMembers}`,
            iconURL: memberWasCatchDS.avatarURL({ extension: 'png', dynamic: true })
        })
    }else {
        embed.setFooter({
            text: `${currentIndex + 1}/${totalMembers}`
        })
    }

    return embed;
}
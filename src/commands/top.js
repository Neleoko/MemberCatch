const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Member = require('../entity/member');
const Guild = require('../entity/guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('Affiche le classement des utilisateurs par niveau'),

    async execute(interaction) {
        // Récupère tous les utilisateurs
        const guildDB = await Guild.getGuildById(interaction.guild.id);
        const allMembers = await Member.getAllMembers(guildDB);
        if (allMembers.length === 0) {
            return interaction.reply('Aucun utilisateur n\'a été enregistré.');
        }
        // Trie les utilisateurs par niveau en ordre décroissant
        const sortedMembers = allMembers.sort((a, b) => b.level - a.level);

        // Crée une promesse pour récupérer les noms d'utilisateur et les informations des utilisateurs qui ont capturé
        const promises = sortedMembers.map(async (member, index) => {
            let capturedByUser;
            if (member.capturedBy) {
                capturedByUser = await interaction.client.users.fetch(member.capturedBy);
            }

            if (capturedByUser !== undefined) {
                capturedByUser = `- Capturé par : <@${capturedByUser.id}>`;
            }
            else {
                capturedByUser = '';
            }

            return `${index + 1}# <@${member.username_id}> - Niveau ${member.level} ${capturedByUser}`;
        });

        // Attends que toutes les promesses soient résolues
        const userInfo = await Promise.all(promises);

        // Crée l'embed pour le classement
        const embed = new EmbedBuilder()
            .setTitle('Classement')
            .setDescription(userInfo.join('\n'));

        // Envoie le classement
        interaction.reply({ embeds: [embed] });
    }
};

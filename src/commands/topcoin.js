const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Member = require('../entity/member');
const Guild = require('../entity/guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('topcoin')
        .setDescription('Affiche le classement des utilisateurs par nombre de pièces'),

    async execute(interaction) {
        // Récupère tous les utilisateurs
        const guildDB = await Guild.getGuildById(interaction.guild.id);
        const allMembers = await Member.getAllMembers(guildDB);
        if (allMembers.length === 0) {
            return interaction.reply('Aucun utilisateur n\'a été trouvé');
        }
        // Trie les utilisateurs par nombre de pièces en ordre décroissant
        const sortedMembers = allMembers.sort((a, b) => b.coins - a.coins);

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

            return `${index + 1}# <@${member.username_id}> - Pièces ${member.coins} ${capturedByUser}`;
        });

        // Attend que toutes les promesses soient résolues
        const userInfo = await Promise.all(promises);

        // Crée un embed avec les informations des utilisateurs
        const embed = new EmbedBuilder()
            .setTitle('Classement des pièces')
            .setDescription(userInfo.join('\n'));

        // Envoie le classement
        interaction.reply({ embeds: [embed] });
    }
};
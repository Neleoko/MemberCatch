const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche toutes les commandes disponibles'),

    async execute(interaction) {
        // Crée un embed pour la liste des commandes
        const embed = new EmbedBuilder()
            .setTitle('Liste des commandes')

        // Parcourt toutes les commandes enregistrées
        interaction.client.commands.forEach((command) => {
            embed.addFields({ name: command.data.name, value: command.data.description });
        });

        // Envoie l'embed avec la liste des commandes
        interaction.reply({ embeds: [embed] });
    }
};

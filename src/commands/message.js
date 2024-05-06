const { SlashCommandBuilder } = require('discord.js');
const { run } = require('../Tools/bddConnect');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('message')
        .setDescription('Calcul le nombre de messages par membre (sauf les bots) dans un canal spécifique'),
    async execute(interaction) {

        // Définition de la donnée à insérer
        const data = {
            username_id: "265962134737780747",
            level: 22,
        };
        await run("members", "insertOne", data);


// Vérification du résultat
        interaction.reply(`Nombre de messages inséré : ${data.level} pour l'utilisateur <@${data.username_id}>`);


    },
};

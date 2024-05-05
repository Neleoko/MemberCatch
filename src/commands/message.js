const { SlashCommandBuilder } = require('discord.js');
const { run } = require('../Tools/bddConnect');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('message')
        .setDescription('Calcul le nombre de messages par membre (sauf les bots) dans un canal spécifique'),
    async execute(interaction) {
        const client = await run();
        const collection = client.db("MemberCatch").collection("members");
        // Définition de la donnée à insérer
        const documentToInsert = {
            username_id: "265962134737780747",
            nb_msg: 22,
        };

// Insertion du document dans la collection
        await collection.insertOne(documentToInsert);

// Vérification du résultat
        interaction.reply(`Nombre de messages inséré : ${documentToInsert.nb_msg} pour l'utilisateur ${documentToInsert.username_id}`);


    },
};

require('log-timestamp'); // Avoir la date sur tous les logs générés
require('dotenv').config(); // Lire le fichier .env

const { Client, GatewayIntentBits, Collection, Routes } = require('discord.js'); // Utiliser les éléments de Discord
const { REST } = require('@discordjs/rest'); // Utiliser pour la diffusion des commandes
const path = require('path'); // Gérer les liens vers les répertoires
const fs = require('node:fs'); // Gérer des fichiers

/* Initialisation de notre bot */
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, // Évènement sur le serveur
        GatewayIntentBits.GuildMembers, // Évènement sur l'arrivée/départ/modification de membre
        GatewayIntentBits.GuildMessages, // Évènement sur un message
        GatewayIntentBits.MessageContent, // Récupérer le contenu d'un message
    ],
});

client.commands = new Collection();
client.reactions = new Collection();


const { commandsHandler } = require('./src/handler/commandsHandler');
const { reactionsHandler } = require('./src/handler/reactionsHandler');
const { eventsHandler } = require('./src/handler/eventsHandler');

eventsHandler(client); // Lancement des évènements
reactionsHandler(client); // Lancement des réactions
const command= commandsHandler(client); // Lancement des commandes


// Connexion à notre bot
client.login(process.env.TOKEN).then(async () => {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    console.log();
    console.log('Started refreshing application (/) commands.');

    // On dispatch les commandes sur tous les serveurs
    await rest.put(
        Routes.applicationCommands(client.user.id), {
            body: command,
    });

    console.log('Successfully registered application commands');
    console.log();
    console.log(`Logged in as ${client.user.tag} !`);
});
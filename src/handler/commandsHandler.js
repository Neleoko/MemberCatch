function commandsHandler(client) {

    const path = require('path'); // Gérer les liens vers les répertoires
    const fs = require('node:fs'); // Gérer des fichiers

    const commandsPath = path.join(__dirname, '..', 'commands');

    const commandsFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

    const commands = []; // Cette variable sera utilisée pour la diffusion de nos commandes sur le ou les serveurs

    for (const file of commandsFiles) {
        const filePath = path.join(commandsPath, file); // Récupération du fichier du serveur
        const command = require(filePath); // On charge le fichier
        commands.push(command.data.toJSON()); // On l'ajoute dans la liste des commandes à déployer
        client.commands.set(command.data.name, command); // Ajout de la commande dans la collection
        console.log(`Commande ${command.data.name} => chargée`);
    }
    return commands;
}

module.exports = {
    commandsHandler
}
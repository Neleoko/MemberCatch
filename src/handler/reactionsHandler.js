function reactionsHandler(client){
    const path = require('path');
    const fs = require('node:fs');

    const reactionsPath = path.join(__dirname, '..', 'reactions');

    const reactionsFiles = fs.readdirSync(reactionsPath).filter((file) => file.endsWith('.js'));
    console.log()
    console.log("--------Chargement des réactions--------")
    for (const file of reactionsFiles) {
        const filePath = path.join(reactionsPath, file);
        const reaction = require(filePath);
        client.reactions.set(reaction.data.name, reaction);
        console.log(`Réaction ${reaction.data.name} => chargée`);
    }
    console.log("----------------------------------------")
}

module.exports = {
    reactionsHandler
}
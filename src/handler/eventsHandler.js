function eventsHandler(client){
    const path = require('path'); // Gérer les liens vers les répertoires
    const fs = require('node:fs'); // Gérer des fichiers

    const eventsPath = path.join(__dirname, '..', 'events');

    const eventsFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

    console.log()
    console.log("--------Chargement des évènements--------")
    for (const file of eventsFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (event.once) { // once → L'évènement se produit lorsque le bot est prêt
            client.once(event.name, (...args) => event.execute(client, ...args));
        } else { // L'évènement peut se produire plusieurs fois
            client.on(event.name, (...args) => event.execute(client, ...args));
        }
        console.log(`Évènement ${event.name} => chargée`);
    }
    console.log("----------------------------------------")
}

module.exports = {
    eventsHandler
}

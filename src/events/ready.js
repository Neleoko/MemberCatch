module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        /* Modification du statut de présence */
        client.user.setPresence({
            activities: [{ name: 'Attrapez tous les membres de votre serveur' }],
            status: 'online',
        });
    },
};
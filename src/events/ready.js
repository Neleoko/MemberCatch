module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        /* Modification du statut de présence */
        client.user.setPresence({
            activities: [{ name: 'Programmation en cours - Bot Discord' }],
            status: 'online',
        });
    },
};
module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(client, interaction) { // On récupère le client et l'interaction
        /* Commande Slash */
        if (interaction.isChatInputCommand()) { // l'interaction est de type commande
            const command = client.commands.get(interaction.commandName); // On récupère donc la commande correspondant au nom de l'intéraction
            if (!command) return; // Si on ne l'a trouve pas, on ne fait rien
            try {
                await command.execute(interaction, client); // On execute les instructions de notre commande
            } catch (error) {
                /* Une erreur est survenue lors de l'exécution de la commande */
                console.error(interaction.commandName, error);
                await interaction.reply({
                    content: 'There was an error while executing this command!',
                    ephemeral: true,
                });
            }
        }
        /* Commande Slash */

        /* Réponse aux réactions */
        if (interaction.isButton() || interaction.isStringSelectMenu()) { // Notre réaction est de type button ou menu de sélection
            if (interaction.message.author.id !== client.user.id) return; // On ne réagit pas à nous même
            const reaction = client.reactions.get(interaction.customId);
            if (!reaction) return;
            reaction.execute(interaction, client);
        }
        /* Réponse aux réactions */
    },
};
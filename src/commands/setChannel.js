
const fs = require('fs');
const path = require('path');
const {SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setchannel')
        .setDescription('Définit le canal pour le leveling')
        .addStringOption(option =>
            option.setName('idchannel')
                .setDescription('L\'ID du canal')
                .setRequired(true)),
    async execute(interaction) {
        // Vérifie si l'utilisateur a la permission d'administrateur
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande.', ephemeral: true });
        }

        const channelId = interaction.options.getString('idchannel'); // Récupère l'ID du canal

        // Vérifie si le canal existe
        const channel = interaction.guild.channels.cache.get(channelId);
        if (!channel) {
            return interaction.reply({ content: 'Ce canal n\'existe pas.', ephemeral: true });
        }

        // Définit l'ID du canal dans le fichier JSON
        fs.readFile(path.join(__dirname, '../serverConf.json'), 'utf8', (err, data) => {
            if (err) {
                console.error('Erreur de lecture du fichier :', err);
                return;
            }

            // Convertir le contenu en objet JavaScript
            let jsonContent = JSON.parse(data);

            // Modifier la valeur de la clé spécifique
            jsonContent.channel.cmdID = channelId;

            // Convertir l'objet JavaScript mis à jour en JSON
            let updatedJson = JSON.stringify(jsonContent, null, 4);

            // Écrire les modifications dans le fichier JSON
            fs.writeFile(path.join(__dirname, '../serverConf.json'), updatedJson, 'utf8', (err) => {
                if (err) {
                    interaction.reply({ content: 'Erreur lors de l\'écriture du fichier.', ephemeral: true });
                    return;
                }
                interaction.reply({ content: `Le canal pour le leveling a été défini à ${channel.name}.`, ephemeral: true });
            });
        });
    },
};
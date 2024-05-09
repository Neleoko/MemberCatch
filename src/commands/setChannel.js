
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
        const channelLeveling = { channelID: channelId };
        fs.writeFileSync(path.join(__dirname, '../channel.json'), JSON.stringify(channelLeveling, null, 4));

        await interaction.reply({ content: `Le canal pour le leveling a été défini à ${channel.name}.`, ephemeral: true });
    },
};
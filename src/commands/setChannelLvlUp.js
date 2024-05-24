const settingGuild = require("../entity/settingGuild");
const Guild = require("../entity/guild");
const {SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setchannellvlup')
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

        const guildDB = await Guild.getGuildById(interaction.guildId); // Récupère le serveur

        try {
            await settingGuild.setChannelLvlUp(guildDB, channelId); // Définit le canal pour le leveling
            interaction.reply({ content: `Le canal pour le leveling a été défini à ${channel.name}.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'Une erreur est survenue lors de la définition du canal pour le leveling.', ephemeral: true });
        }

    },
};
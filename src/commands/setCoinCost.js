const settingGuild = require("../entity/settingGuild");
const Guild = require("../entity/guild");
const {SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setcoincost')
        .setDescription('Définit le prix pour le coût de autorelease')
        .addStringOption(option =>
            option.setName('coins')
                .setDescription('cout en coins')
                .setRequired(true)),
    async execute(interaction) {
        // Vérifie si l'utilisateur a la permission d'administrateur
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande.', ephemeral: true });
        }

        const coins = interaction.options.getString('coins'); // Récupère l'ID du canal

        const guildDB = await Guild.getGuildById(interaction.guildId); // Récupère le serveur

        try {
            await settingGuild.setCoinCost(guildDB, coins); // Définit le canal pour le leveling
            interaction.reply({ content: `Le coût pour l'auto release a été défini à ${coins} coins.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'Une erreur s\'est produite lors de la définition du canal pour le leveling.', ephemeral: true });
        }


    },
};
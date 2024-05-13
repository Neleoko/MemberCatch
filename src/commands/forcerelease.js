const { SlashCommandBuilder, PermissionsBitField} = require('discord.js');
const Member = require('../entity/member');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('force-release')
        .setDescription('Libère un membre capturé')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('Le membre à libérer')
                .setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande.', ephemeral: true });
        }

        const memberToRelease = interaction.options.getUser('member');

        // Vérifie si l'utilisateur a capturé le membre
        const member = await Member.getMemberDB(memberToRelease.id, interaction.guild.id);
        if (member.capturedBy == null) {
            return interaction.reply('Ce membre n\'est pas capturé.');
        }
        // Libère le membre
        await Member.releaseMember(member, interaction.guild.id);

        // Envoie une réponse à l'utilisateur
        interaction.reply(`Vous avez libéré <@${memberToRelease.id}> qui était capturé par <@${member.capturedBy}>.`);
    }
};
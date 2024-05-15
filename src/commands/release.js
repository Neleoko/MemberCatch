const { SlashCommandBuilder } = require('discord.js');
const Member = require('../entity/member');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('release')
        .setDescription('Libère un membre que vous avez capturé')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('Le membre à libérer')
                .setRequired(true)),

    async execute(interaction) {
        const memberToRelease = interaction.options.getUser('member');

        // Vérifie si l'utilisateur a capturé le membre
        const member = await Member.getMemberDB(memberToRelease.id, interaction.guild.id);
        if (!await Member.getMemberDB(interaction.user.id, interaction.guild.id)) {
            return interaction.reply({ content: 'Vous ne possédez pas de profil.', ephemeral: true });
        }
        if (member.capturedBy !== interaction.user.id) {
            return interaction.reply('Vous ne possédez pas ce membre.');
        }

        // Libère le membre
        await Member.releaseMember(member, interaction.guild.id);

        // Envoie une réponse à l'utilisateur
        interaction.reply(`Vous avez libéré <@${memberToRelease.id}>`);
    }
};
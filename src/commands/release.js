const { SlashCommandBuilder } = require('discord.js');
const Member = require('../entity/member');
const Guild = require('../entity/guild');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('release')
        .setDescription('Libère un membre que vous avez capturé')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('Le membre à libérer')
                .setRequired(true)),

    async execute(interaction) {
        // VERIFIER SI C'EST UN BOT LE MEMBRE DANS L'OPTION
        if (interaction.options.getUser('member').bot) {
            return interaction.reply({ content: 'Les bots ne peuvent pas être capturés.', ephemeral: true });
        }
        const memberToRelease = interaction.options.getUser('member');

        // Vérifie si l'utilisateur a capturé le membre
        const guild = await Guild.getGuildById(interaction.guild.id);
        const member = await Member.getMemberDB(memberToRelease.id, guild);
        if (!await Member.getMemberDB(interaction.user.id, guild)) {
            return interaction.reply({ content: 'Vous ne possédez pas de profil.', ephemeral: true });
        }
        if (member.capturedBy !== interaction.user.id) {
            return interaction.reply('Vous ne possédez pas ce membre.');
        }

        // Libère le membre
        await Member.releaseMember(member, guild);

        // Envoie une réponse à l'utilisateur
        interaction.reply(`Vous avez libéré <@${memberToRelease.id}>`);
    }
};
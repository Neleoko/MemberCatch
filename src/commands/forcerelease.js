const { SlashCommandBuilder, PermissionsBitField} = require('discord.js');
const Member = require('../entity/member');
const Guild = require('../entity/guild');

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
        const guildDB = await Guild.getGuildById(interaction.guild.id);
        const member = await Member.getMemberDB(memberToRelease.id, guildDB);
        if (member == null) {
            return interaction.reply('Ce membre n\'a pas de profil.');
        }
        if (member.capturedBy == null) {
            return interaction.reply('Ce membre n\'est pas capturé.');
        }
        // Libère le membre
        await Member.releaseMember(member, guildDB);

        // Envoie une réponse à l'utilisateur
        interaction.reply(`Vous avez libéré <@${memberToRelease.id}> qui était capturé par <@${member.capturedBy}>`);
    }
};
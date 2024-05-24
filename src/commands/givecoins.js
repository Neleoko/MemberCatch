const { ButtonStyle, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder} = require('discord.js');
const Member = require('../entity/member');
const Guild = require('../entity/guild');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('givecoins')
        .setDescription('Donner des pièces à un autre membre')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Membre à qui donner des pièces')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Montant à donner')
                .setRequired(true)
        ),
    async execute(interaction) {
        const memberToGive = interaction.options.getMember('user');

        const guildDB = await Guild.getGuildById(interaction.guild.id);

        const memberInteractionDB = await Member.getMemberDB(interaction.user.id, guildDB);
        const memberToGiveDB = await Member.getMemberDB(memberToGive.id, guildDB);

        if (!memberInteractionDB) {
            return interaction.reply({ content: 'Vous n\'avez pas de profil', ephemeral: true });
        }
        if (!memberToGiveDB) {
            return interaction.reply({ content: 'Ce membre n\'a pas de profil', ephemeral: true });
        }
        const amount = interaction.options.getInteger('amount');

        if (amount <= 0) {
            return interaction.reply({ content: 'Le montant doit être supérieur à 0', ephemeral: true });
        }
        if (memberInteractionDB.coins < amount) {
            return interaction.reply({ content: 'Vous n\'avez pas assez de pièces', ephemeral: true });
        }

        memberInteractionDB.coins -= amount;
        memberToGiveDB.coins += amount;

        await memberInteractionDB.save();
        await memberToGiveDB.save();

        return interaction.reply({ content: `Vous avez donné ${amount} pièces à ${memberToGive.user.username}` });
    }
}
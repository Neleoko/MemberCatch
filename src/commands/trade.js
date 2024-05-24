const { ButtonStyle, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder} = require('discord.js');
const Member = require('../entity/member');
const Guild = require('../entity/guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trade')
        .setDescription('Echange un membre avec une personne')
        .addUserOption(option =>
            option.setName('input')
                .setDescription('Membre avec qui échanger')
                .setRequired(true)
        ),
    async execute(interaction) {
        // Récupérer le membre avec qui échanger
        const memberTradeWith = interaction.options.getMember('input');
        const guildDB = await Guild.getGuildById(interaction.guild.id);

        if (memberTradeWith === null) {
            await interaction.reply({ content: `Le membre n'est pas sur le serveur.`, ephemeral: true });
            return;
        }
        if (memberTradeWith === interaction.user) {
            await interaction.reply({ content: `Vous ne pouvez pas échanger avec vous même.`, ephemeral: true });
            return;
        }

        await interaction.reply({ content: `Veuillez entrer le pseudo du membre a échanger :` });

        // Filtrer les messages de l'utilisateur
        let filter = m => m.author.id === interaction.user.id;
        const allMembers = await interaction.guild.members.fetch();
        let member1 = null;
        let response = null;

        while (!member1) { // Tant que le membre n'est pas trouvé
            try {
                const collect = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
                response = collect.first().content;
            } catch (error) {
                // await interaction.followUp({ content: `Time out. Please try again.`, ephemeral: true });
                return interaction.followUp({ content: 'Temps écoulé.', ephemeral: true });
            }
            member1 = allMembers.find(m => m.user.username === response); // Récupérer le membre
            // Vérifier si le membre existe et si l'utilisateur le possède
            if (!member1 || await Member.getMemberDB(member1.id, guildDB) === null) {
                await interaction.followUp({ content: `Le membre ${response} n'existe pas ou n'a pas de profil, veuillez réessayer.` });
                member1 = null;
            }else if (!await verifyUserCaughMember(member1, guildDB, interaction.user)){
                await interaction.followUp({ content: `Vous ne possédez pas ce membre, veuillez réessayer.` });
            }
        }


        await interaction.followUp({ content: `<@${memberTradeWith.user.id}>, Choisissez un membres à échanger avec ${interaction.user.username} :` });
        filter = m => m.author.id === memberTradeWith.id;
        response = null;
        let member2 = null;

        while (!member2) { // Tant que le membre n'est pas trouvé
            // Récupérer le message de l'utilisateur
            try {
                const collect = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
                response = collect.first().content;
            } catch (error) {
                return interaction.followUp({ content: `Temps écoulé` , ephemeral: true});
            }
            member2 = allMembers.find(m => m.user.username === response); // Récupérer le membre
            // Vérifier si le membre existe et si l'utilisateur le possède
            if (!member2 || await Member.getMemberDB(member2.id, guildDB) === null) {
                await interaction.followUp({ content: `Le membre ${response} n'existe pas ou n'a pas de profil, veuillez réessayer.` });
                member2 = null;
            }else if (!await verifyUserCaughMember(member2, interaction.guild.id, memberTradeWith)) {
                await interaction.followUp({content: `Vous ne possédez pas ce membre, veuillez réessayer.`});
            }
        }

        // Echange des membres

        const embed = new EmbedBuilder()
            .setTitle('Trade de membres')
            .setDescription(`<@${interaction.user.id}> souhaite échanger ${member1.user.username} contre ${member2.user.username}. Acceptez-vous l'échange ?`)
            .setColor('#FFFFFF')
            .setTimestamp();

        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept')
                    .setLabel('Accepter')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('refuse')
                    .setLabel('Refuser')
                    .setStyle(ButtonStyle.Danger)
            );

        const message = await interaction.followUp({ embeds: [embed], components: [actionRow], fetchReply: true });

        const filterButton = (interaction) => interaction.customId === 'accept' || interaction.customId === 'refuse';
        const collector = message.createMessageComponentCollector({ filterButton, time: 120000 });
        collector.on('collect', async i => {
            if (i.user.id === interaction.user.id){
                if (i.customId === 'accept') {
                    try {
                        await Member.updateCapturedBy(member1.id, memberTradeWith.user.id, guildDB);
                        await Member.updateCapturedBy(member2.id, interaction.user.id, guildDB);
                    } catch (e) {
                        console.log(e);
                        return await interaction.followUp({ content: `Une erreur est survenue lors de l'échange.` });;
                    }
                    embed
                        .setDescription(`<@${interaction.user.id}> a accepté l'échange.`)
                        .setColor('#00FF00');
                    await i.update({ embeds: [embed], components: [] });
                } else {
                    embed
                        .setDescription(`<@${interaction.user.id}> a refusé l'échange.`)
                        .setColor('#FF0000');
                    await i.update({ embeds: [embed], components: [] });
                }
            }
        });
    }

}

async function verifyUserCaughMember(member, guildId, userInteract) {
    if (!member) return false;
    const memberDB = await Member.getMemberDB(member.id, guildId);
    if (!memberDB) return false;
    return memberDB.capturedBy === userInteract.id;
}

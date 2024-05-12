const {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder  } = require("discord.js");
const {ComponentType} = require("discord-api-types/v10");
const Member = require('../entity/member');
const { getUserAvatarColor } = require('../utils/nodeVibrant');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('summon')
        .setDescription('Invoquer un membre pour l\'attraper'),

    async execute(interaction, client) {
        let userFetched;

        // Récupère un membre aléatoire
        const userSummoned = await Member.getRandomMember(interaction.user.id, interaction.guildId)
        // Récupère le membre invoqué
        const userSummonedDS = await client.users.fetch(userSummoned.username_id)

        if (!userSummoned) { // Vérifie si le membre a été trouvé
            return interaction.reply('Aucun membre trouvé. Veuillez réessayer plus tard.')
        }

        const userWhoSummoned = await Member.getMemberDB(interaction.user.id, interaction.guildId)
        if (!userWhoSummoned) { // Vérifie si le membre a été trouvé
            return interaction.reply('Erreur lors de la récupération de votre profil')
        }

        if (userWhoSummoned.lastSummon) {
            const lastSummonDate = new Date(userWhoSummoned.lastSummon);
            const currentDate = new Date();
            const timeDifference = currentDate - lastSummonDate; // en millisecondes

            const timeDifferenceInHours = timeDifference / (1000 * 60 * 60); // convertir en heures

            if (timeDifferenceInHours < 1) {
                const timeLeft = 1 - timeDifferenceInHours;
                const nextSummonTime = new Date(Date.now() + timeLeft * 1000 * 60 * 60); // Convertir le temps restant en millisecondes et l'ajouter au temps actuel

                // Convertir la date en timestamp Unix (nombre de secondes depuis le 1er janvier 1970)
                const nextSummonTimestamp = Math.floor(nextSummonTime.getTime() / 1000);

                return interaction.reply(`Vous avez déjà invoqué un membre dans la dernière heure. Prochaine invocation possible à <t:${nextSummonTimestamp}:R>.`);
            }
        }
        // Met à jour la date de la dernière invocation
        await Member.updateDateLastSummon(interaction.user.id, interaction.guildId);



        if (!userSummonedDS) { // Vérifie si le membre a été trouvé
            return interaction.reply('Erreur lors de la récupération du membre')
        }

        // Récupère le membre qui a capturé le membre invoqué
        if (userSummoned.capturedBy !== null) { // Vérifie si le membre a été capturé
            userFetched = await client.users.fetch(userSummoned.capturedBy) // Récupère le membre qui a capturé le membre invoqué
        }
        // Récupère la couleur dominante de l'avatar du membre
        const avatarUrlSummoned = userSummonedDS.avatarURL({ extension: 'png', dynamic: true });

        // Crée l'embed de l'invocation
        const embed = new EmbedBuilder()
            .setAuthor({name: 'Invocation de ' + userSummonedDS.username })
            .addFields(
                { name: 'Level', value: userSummoned.level.toString() },
                { name: 'Coin', value: userSummoned.coins.toString() + ' 🪙', inline: true },
            )
            .setImage(avatarUrlSummoned)

        await getUserAvatarColor(avatarUrlSummoned).then((dominantColor) => {
            embed.setColor(dominantColor);
        }); // Ajoute la couleur dominante de l'avatar du membre

        if (userFetched) {
            embed.setFooter({
                text: 'Capturé par ' + userFetched.username ,
                iconURL: userFetched.avatarURL() });
        }

        let components = [];
        if (userSummoned.capturedBy === null) {
            const catchButton = new ButtonBuilder()
                .setCustomId('catch')
                .setLabel('Attraper ce membre')
                .setStyle(ButtonStyle.Primary);

            const buttonRow = new ActionRowBuilder().addComponents(catchButton);
            components.push(buttonRow);
        }

        const reply = await interaction.reply({
            embeds: [embed],
            components: components});

        if (userSummoned.capturedBy === null) {
            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.Button, time: 15000
            });
            let isProcessing = false;
            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'catch') {
                    const userWhoClicked = interaction.user;

                    const memberWhoCaught = await Member.getMemberDB(userWhoClicked.id, interaction.guild.id);

                    if (isProcessing) {
                        return;
                    }

                    if (memberWhoCaught.lastCatch) {
                        const lastCatchDate = new Date(memberWhoCaught.lastCatch);
                        const currentDate = new Date();
                        const timeDifference = currentDate - lastCatchDate; // en millisecondes

                        const timeDifferenceInHours = timeDifference / (1000 * 60 * 60); // convertir en heures

                        if (timeDifferenceInHours < 12) {
                            const timeLeft = Math.floor(24 - timeDifferenceInHours);
                            const nextCatchTime = new Date(Date.now() + timeLeft * 1000 * 60 * 60);

                            const nextCatchTimestamp = Math.floor(nextCatchTime.getTime() / 1000);
                            return interaction.reply(`Vous avez déjà attrapé un membre dans les dernières 24 heures. Prochain catch possible dans <t:${nextCatchTimestamp}:R>.`);
                        }
                    }

                    // Indiquez qu'une interaction est en cours de traitement
                    isProcessing = true;

                    const caught = Member.catchMember(userSummoned, userWhoClicked)

                    if (caught) {
                        await interaction.update({
                            embeds: [
                                embed.setFooter(
                                    {
                                        text: 'Capturé par ' + userWhoClicked.username,
                                        iconURL: userWhoClicked.avatarURL()
                                    }
                                )],
                            components: []
                        });

                        await interaction.followUp({
                            content: '<@' + userWhoClicked.id + '> à attrapé le membre : ' + userSummonedDS.username,
                            components: []
                        });

                        await Member.updateDateCatchUser(userWhoClicked.id, interaction.guild.id);
                    }
                    isProcessing = false;
                }
            })
        }
    },
};
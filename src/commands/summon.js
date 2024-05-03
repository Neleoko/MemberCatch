const {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder  } = require("discord.js");
const {ComponentType} = require("discord-api-types/v10");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('summon')
        .setDescription('Invoquer un membre pour l\'attraper'),

    async execute(interaction) {
        const exampleEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setAuthor({ iconURL: interaction.user.avatarURL(), name: 'Inventaire de ' + interaction.user.username })
            .setDescription('Some description here')
            .addFields(
                { name: 'Regular field title', value: 'Some value here' },
                { name: '\u200B', value: '\u200B' },
                { name: 'Inline field title', value: 'Some value here', inline: true },
                { name: 'Inline field title', value: 'Some value here', inline: true },
            )
            .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
            .setImage(interaction.user.avatarURL())
            .setFooter({ text: 'Capturé par ' + interaction.user.username, iconURL: interaction.user.avatarURL() });
        const catchButton = new ButtonBuilder()
            .setCustomId('catch')
            .setLabel('Attraper ce membre')
            .setStyle(ButtonStyle.Primary);

        const buttonRow = new ActionRowBuilder().addComponents(catchButton);

        const reply = await interaction.reply({ embeds: [exampleEmbed], components: [buttonRow]});

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button, time: 15000
        });
        collector.on('collect', (interaction) => {
            if (interaction.customId === 'catch'){
                interaction.reply({ content: 'Vous avez attrapé le membre : ' + interaction.user.username, components: [] });
            }
        })
    },
};
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function setColorLatency(ping) {

    let color;

    if (ping > 500) {
        color = '#FF0000';
    } else if (ping > 200) {
        color = '#FFA500';
    } else if (ping > 100) {
        color = '#FFFF00';
    } else {
        color = '#00FF00';
    }

    return color;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Affiche la latence du bot'),
    async execute(interaction) {

        const receivedTimestamp = Date.now();

        const embed = new EmbedBuilder()
            .setColor('White') // Temporairement définir la couleur sur la plus basse latence
            .setTitle('PONG ! 🏓')
            .setDescription('Calcul de la latence...');

        const reply = await interaction.reply({ embeds: [embed], fetchReply: true });

        const botLatency = Date.now() - receivedTimestamp;

        embed
            .setColor(setColorLatency(botLatency))
            .setDescription(`La latence du bot est de ${botLatency} ms`);

        await reply.edit({ embeds: [embed] });
    },
};
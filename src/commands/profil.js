const {
    SlashCommandBuilder,
    EmbedBuilder,
} = require('discord.js');

const { getUserAvatarColor } = require('../utils/nodeVibrant');

const Member = require('../entity/member');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profil')
        .setDescription('Affiche votre profil de membres')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Utilisateur dont vous voulez afficher le profil.')),
    async execute(interaction) {
        const userOption = interaction.options.getUser('user');

        const userId = userOption ? userOption.id : interaction.user.id;

        const memberData = await Member.getMemberDB(userId, interaction.guild.id);

        if (memberData) {
            const memberCapturedBy = await Member.getMemberDB(memberData.capturedBy, interaction.guild.id);
            const avatarURL = (userOption || interaction.user).avatarURL({extension: 'png', dynamic: true});
            getUserAvatarColor(avatarURL).then(async dominantColor => {
                console.log(dominantColor);
            const embed = new EmbedBuilder()
                .setColor(dominantColor)
                .setAuthor({
                    iconURL: (userOption || interaction.user).avatarURL(),
                    name: 'Profil de ' + (userOption || interaction.user).username
                })
                .setDescription(`
                        Niveau : ${memberData.level}\n
                        XP : ${memberData.xp}/${Member.calculateNextLevelXP(memberData.level)}\n
                        Pièces : ${memberData.coins} 🪙\n
                        `)
                .setImage((userOption || interaction.user).avatarURL())
            if (memberData.capturedBy) {
                embed.setFooter({
                    text: 'Capturé par ' + memberCapturedBy.username,
                    iconURL: memberCapturedBy.avatarURL
                });
            }
                await interaction.reply({embeds: [embed]});
            })
        } else {
            interaction.reply("L'utilisateur spécifié n'a pas encore de profil de membre !");
        }
    }
}

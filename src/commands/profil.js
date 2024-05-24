const {
    SlashCommandBuilder,
    EmbedBuilder,
} = require('discord.js');

const { getUserAvatarColor } = require('../utils/nodeVibrant');

const Member = require('../entity/member');
const Guild = require('../entity/guild');
const SettingGuild = require('../entity/settingGuild');

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
        const guildDB = await Guild.getGuildById(interaction.guild.id);
        const memberData = await Member.getMemberDB(userId, guildDB);
        const settingGuild = await SettingGuild.getSettingGuild(guildDB);

        if (memberData) {
            const avatarURL = (userOption || interaction.user).avatarURL({extension: 'png', dynamic: true});
            await getUserAvatarColor(avatarURL).then(async dominantColor => {
            const embed = new EmbedBuilder()
                .setColor(dominantColor)
                .setAuthor({
                    iconURL: (userOption || interaction.user).avatarURL(),
                    name: 'Profil de ' + (userOption || interaction.user).username
                })
                .addFields(
                    { name: 'Niveau', value: memberData.level.toString() },
                    { name: 'XP', value: `${memberData.xp}/${calculateNextLevelXP(memberData.level, settingGuild)}` },
                    { name: 'Pièces', value: `${memberData.coins} 🪙` }

                )
                .setImage(avatarURL)
            if (memberData.capturedBy) {
                const memberCapturedByDS = await interaction.client.users.fetch(memberData.capturedBy);
                embed.setFooter({
                    text: 'Capturé par ' + memberCapturedByDS.username,
                    iconURL: memberCapturedByDS.avatarURL()
                });
            }
                await interaction.reply({embeds: [embed]});
            })
        } else {
            interaction.reply("L'utilisateur spécifié n'a pas encore de profil de membre !");
        }
    }
}

function calculateNextLevelXP(currentLevel, settingGuild) {
    return Math.floor(settingGuild.levelBaseXP * Math.pow(settingGuild.ratioXP, currentLevel)); // XP nécessaire pour atteindre le niveau suivant
}
const {
    SlashCommandBuilder,
    EmbedBuilder,
} = require('discord.js');
const { run } = require('../Tools/bddConnect');
const Vibrant = require('node-vibrant');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Affiche votre profil de membres')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Utilisateur dont vous voulez afficher le profil.')),
    async execute(interaction) {
        const userOption = interaction.options.getUser('user');
        const userId = userOption ? userOption.id : interaction.user.id;

        const user = await getUser(userId);
        console.log(user)
        if (user) {
            const avatarURL = (userOption || interaction.user).avatarURL({ extension: 'png', dynamic: true });

            getUserAvatarColor(avatarURL).then(palette => {
                let dominantColor = palette.Vibrant.rgb;
                dominantColor = rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2]);
                const embed = new EmbedBuilder()
                    .setColor(dominantColor)
                    .setAuthor({ iconURL: (userOption || interaction.user).avatarURL(), name: 'Profil de ' + (userOption || interaction.user).username })
                    .setDescription(`Niveau : ${user.level}\nXP : ${user.xp}\nPièces : ${user.coin}`)
                    .setImage((userOption || interaction.user).avatarURL())

                interaction.reply({ embeds: [embed] });

            })
        } else {
            interaction.reply("L'utilisateur spécifié n'a pas encore de profil de membre !");
        }
    }
}

async function getUser(userId) {
    // Obtenir l'utilisateur depuis la base de données
    const data = {
        username_id: userId,
    };
    return await run("members", "findOne", null, data);
}

async function getUserAvatarColor(avatarURL) {
    return new Promise((resolve, reject) => {
        Vibrant.from(avatarURL).getPalette((err, palette) => {
            if (err) {
                reject(err);
            } else {
                resolve(palette);
            }
        });
    });
}

function rgbToHex(r, g, b) {
    // Convertir chaque composante en sa représentation hexadécimale
    const red = r.toString(16).padStart(2, '0');
    const green = g.toString(16).padStart(2, '0');
    const blue = b.toString(16).padStart(2, '0');

    // Concaténer les composantes pour former la couleur hexadécimale
    const hexColor = `#${red}${green}${blue}`;

    return hexColor.toUpperCase(); // Optionnel : convertir en majuscules pour la cohérence
}

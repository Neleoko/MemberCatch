const XPQueue = require("../utils/XPQueue");

const Member = require('../entity/member');
const Channel = require('../channel.json'); // Importe le fichier JSON

const xpQueue = new XPQueue(5000); // 30 secondes de cooldown entre chaque gain d'XP
module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(client, message) {
        // Ignore les messages de type "7" (messages de type GUILD_MEMBER_JOIN)
        if (message.type === 7) {
            return;
        }

        // Vérifiez si le message a été envoyé par un utilisateur et non par un bot
        if (!message.author.bot) {
            let memberData;
            if (!xpQueue.canGetXP(message.author.id)) {
                return;
            }

            memberData = await Member.getMemberDB(message.author.id, message.guild.id); // Récupère les données de l'utilisateur
            if (!memberData) { // Si l'utilisateur n'existe pas dans la base de données
                memberData = await Member.addNewUser(message); // Ajoute l'utilisateur à la base de données
            }

            const gainXp = Math.floor(Math.random() * 5) + 100; // Gain d'XP aléatoire entre 1 et 5
            const cumul = memberData.xp + gainXp;
            const neededXp = Member.calculateNextLevelXP(memberData.level);

            const cmdChannel = message.guild.channels.cache.get(Channel.channelID);

            if (cumul >= neededXp) {
                const newXp = cumul - neededXp; // XP restant après avoir atteint le niveau suivant
                await Member.updateUserLevel(memberData, true, newXp);
                const randomCoins = Math.floor(Math.random() * 6) + 10;
                await Member.addCoins(memberData, randomCoins);
                if (cmdChannel){
                    cmdChannel.send(`Félicitations <@${message.author.id}>, vous avez atteint le niveau ${memberData.level + 1} et obtenu ${randomCoins}🪙 pièces !`);
                } else {
                    message.channel.send(`Félicitations <@${message.author.id}>, vous avez atteint le niveau ${memberData.level + 1} et obtenu ${randomCoins}🪙 pièces !`);
                }
            } else {
                await Member.updateUserLevel(memberData, false, cumul);
            }
            xpQueue.markXPObtained(message.author.id);
        }
    },
};
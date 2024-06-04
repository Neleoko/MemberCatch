const XPQueue = require("../utils/XPQueue");

const Member = require('../entity/member');
const Guild = require('../entity/guild');
const SettingGuild = require('../entity/settingGuild');

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
            let guildData;
            if (!xpQueue.canGetXP(message.author.id)) {
                return;
            }
            guildData = message.guild

            const guildDB = await Guild.getGuildById(guildData.id);
            const settingGuild = await SettingGuild.getSettingGuild(guildDB);

            memberData = await Member.getMemberDB(message.author.id, guildDB); // Récupère les données de l'utilisateur

            const gainXp = Math.floor(Math.random() * 1) + 5; // Génère un nombre aléatoire entre 1 et 5
            const cumul = memberData.xp + gainXp;
            const neededXp = calculateNextLevelXP(memberData.level, settingGuild); // XP nécessaire pour atteindre le niveau suivant

            const cmdChannel = message.guild.channels.cache.get(settingGuild.setChannelLvlUp);

            if (cumul >= neededXp) { // Si l'utilisateur a atteint le niveau suivant
                const newXp = cumul - neededXp; // XP restant après avoir atteint le niveau suivant
                await Member.updateUserLevel(memberData, true, newXp, guildDB);
                const randomCoins = Math.floor(Math.random() * 6) + 10;
                await Member.addCoins(memberData, randomCoins, guildDB);
                if (cmdChannel){
                    cmdChannel.send(`Félicitations <@${message.author.id}>, vous avez atteint le niveau ${memberData.level + 1} et obtenu ${randomCoins}🪙 pièces !`);
                } else {
                    message.channel.send(`Félicitations <@${message.author.id}>, vous avez atteint le niveau ${memberData.level + 1} et obtenu ${randomCoins}🪙 pièces !`);
                }
            } else {
                await Member.updateUserLevel(memberData, false, cumul, guildDB);
            }
            xpQueue.markXPObtained(message.author.id);
        }
    },
};

function calculateNextLevelXP(currentLevel, settingGuild) {
    return Math.floor(settingGuild.levelBaseXP * Math.pow(settingGuild.ratioXP, currentLevel)); // XP nécessaire pour atteindre le niveau suivant
}
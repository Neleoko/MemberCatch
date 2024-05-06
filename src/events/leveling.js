const {run} = require("../Tools/bddConnect");
const XPQueue = require("../Tools/XPQueue");

const xpQueue = new XPQueue(1000); // 30 secondes de cooldown entre chaque gain d'XP
module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(client, message) {
        let user;
        console.log(message.type)

        // Ignore les messages de type "7" (messages de type GUILD_MEMBER_JOIN)
        if (message.type === 7) {
            return;
        }

        // Vérifiez si le message a été envoyé par un utilisateur et non par un bot
        if (!message.author.bot) {
            if (!xpQueue.canGetXP(message.author.id)) {
                return;
            }
            user = await getUser(message.author.id);

            if (!user) {
                user = await addUser(message.author.username, message.author.id);
            }

            const gainXp = Math.floor(Math.random() * 5)+50;
            const cumul = user.xp + gainXp;
            const neededXp = calculateNextLevelXP(user.level);

            if (cumul >= neededXp) {
                const newXp = cumul - neededXp; // XP restant après avoir atteint le niveau suivant
                await updateUserLevel(user, true, newXp);
                const randomCoins = Math.floor(Math.random() * 6) + 10;
                await addCoins(user, randomCoins);
                message.channel.send(`Félicitations ${user.username}, vous avez atteint le niveau ${user.level + 1} et obtenu ${randomCoins}🪙 pièces !`);
            } else {
                await updateUserLevel(user, false, cumul);
            }
            xpQueue.markXPObtained(message.author.id);
        }
    },
};

async function getUser(userId) {
    // Obtenir l'utilisateur depuis la base de données
    const data = {
        username_id: userId,
    };
    return await run("members", "findOne", null, data);
}

function calculateNextLevelXP(currentLevel) {
    const baseXP = 100; // XP de base pour le niveau 1
    const ratio = 1.1;

    return Math.floor(baseXP * Math.pow(ratio, currentLevel)); // XP nécessaire pour atteindre le niveau suivant
}

// Fonction pour mettre à jour le niveau de l'utilisateur dans la base de données
async function updateUserLevel(user, lvlUp, newXp) {
    let newLevel;

    if (lvlUp === true) { // Si l'utilisateur a atteint le niveau suivant
        newLevel = user.level + 1;
    } else {
        newLevel = user.level;
    }

    const data = {
        $set:{
            level: newLevel,
            xp: newXp,
        },
    };

    const filter = { username_id: user.username_id };

    await run("members", "updateOne", filter, data);
}

async function addUser(username, userId) {
    const data = {
        username: username,
        username_id: userId,
        level: 0,
        xp: 0,
        coin: 0,
    };

    return await run("members", "insertOne", null, data);
}

async function addCoins(user, coins) {
    const data = {
        $set: {
            coin: coins,
        },
    };

    const filter = { username_id: user.username_id };

    await run("members", "updateOne", filter, data);
}

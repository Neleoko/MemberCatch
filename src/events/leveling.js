const {run} = require("../Tools/bddConnect");

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(client, message) {
        // Vérifiez si le message a été envoyé par un utilisateur et non par un bot
        if (!message.author.bot) {
            console.log(`Message de ${message.author.username} : ${message.content}`);
            const user = await getUser(message.author.id);
            console.log(user);
            if (!user){
                console.log("Utilisateur non trouvé, ajout dans la base de données");
                const data = {
                    username: message.author.username,
                    username_id: message.author.id,
                    xp: 0,
                    level: 0,
                };
                await run("members", "insertOne", data);
            }
            console.log(await getUserLevel(message.author.id))
            const xpToAdd = await updateUserXP(await getUser(message.author.id), calculateXPToAdd(await getUserLevel(message.author.id)));
            // console.log(xpToAdd);
            // const user = client.author;
            //
            // // Ajouter l'XP à l'utilisateur dans la base de données
            // await updateUserXP(user.id, xpToAdd);
            //
            // // Vérifiez si l'utilisateur a monté de niveau
            // const userLevel = await getUserLevel(user.id);
            // const nextLevelXP = calculateNextLevelXP(userLevel);
            //
            // if (await getUserXP(user.id) >= nextLevelXP) {
            //     // L'utilisateur a monté de niveau
            //     await updateUserLevel(user.id, userLevel + 1);
            //     message.channel.send(`Félicitations ${user.username}, vous avez atteint le niveau ${userLevel + 1} !`);
            // }
        }
    },
};
// Lorsqu'un message est envoyé


async function getUser(userId) {
    // Obtenir l'utilisateur depuis la base de données
    const data = {
        username_id: userId,
    };
    return await run("members", "findOne", data);
}

// Fonction pour mettre à jour l'XP de l'utilisateur dans la base de données
async function updateUserXP(user, xpToAdd) {
    // Mettre à jour l'XP de l'utilisateur dans la base de données
    const data = {
        username_id: user.id,
        level: ,
    };
    await run("members", "insertOne", data);
}

// Fonction pour obtenir le niveau de l'utilisateur à partir de la base de données
async function getUserLevel(userId) {
    // Obtenir le niveau de l'utilisateur depuis la base de données
    const data = {
        username_id: userId,
    };
    const user = await run("members", "findOne", data);
    return user.level;
}

// Fonction pour calculer le prochain seuil d'XP pour atteindre le niveau suivant
function calculateNextLevelXP(currentLevel) {
    // Calculer le prochain seuil d'XP en fonction du niveau actuel
    return calculateXPToAdd(currentLevel + 1);
}

// Fonction pour mettre à jour le niveau de l'utilisateur dans la base de données
async function updateUserLevel(userId, newLevel) {
    // Mettre à jour le niveau de l'utilisateur dans la base de données
    const data = {
        username_id: userId,
        level: newLevel,
    };
    await run("members", "insertOne", data);
}

// Fonction pour obtenir l'XP de l'utilisateur à partir de la base de données
async function getUserXP(userId) {
    // Obtenir l'XP de l'utilisateur depuis la base de données
    const data = {
        username_id: userId,
    };
    const user = await run("members", "findOne", data);
    return user.level;
}

function calculateXPToAdd(currentLevel) {
    let XP_MULTIPLIER = 1.5;
    return Math.floor(100 * Math.pow(XP_MULTIPLIER, currentLevel - 1)); // Exemple de calcul exponentiel
}
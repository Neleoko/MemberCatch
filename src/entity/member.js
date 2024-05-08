const { model, Schema} = require('mongoose');
const levelSettings = require('../levelSettings.json');

const memberSchema = new Schema({
    username_id: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
    },
    serveur_id: {
        type: String,
        required: true
    },
    avatarURL: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        default: 0
    },
    xp: {
        type: Number,
        default: 0
    },
    coins: {
        type: Number,
        default: 0
    },
    capturedBy: {
        type: String,
        default: null
    },
    lastSummon: {
        type: Date,
        default: null
    },
    lastCatch: {
        type: Date,
        default: null
    },
}, {
    database: 'MemberCatch',
    collection: 'members',
    versionKey: false,
    statics: {
        getMemberDB: function (username_id, serveur_id) {
            return this.findOne(
                {
                    username_id: username_id,
                    serveur_id: serveur_id
                }
                );
        },
        getUserDiscord: function (username_id, client) {
            return client.users.cache.get(username_id);
        },
        getRandomMember: async function (username_id, serveur_id) {
            const result = await this.aggregate([
                {
                    $match: {
                        serveur_id: serveur_id,
                        username_id: { $ne: username_id }
                    }
                },
                { $sample: { size: 1 } }
            ]);
            return result[0];
        },
        calculateNextLevelXP: function(currentLevel) {
            return Math.floor(levelSettings.baseXP * Math.pow(levelSettings.ratio, currentLevel)); // XP nécessaire pour atteindre le niveau suivant
        },
        addNewUser: function (member) {
            const newMember = new this({
                username_id: member.author.id,
                username: member.author.username,
                serveur_id: member.guild.id,
                avatarURL: member.author.avatarURL(),
            });
            return newMember.save();
        },
        addCoins: function (member, coins) {
            const data = {
                $inc: {
                    coins: coins
                }
            };

            const filter = { username_id: member.username_id };

            return this.updateOne(filter, data);
        },
        catchMember: async function (member, captor) {
            const data = {
                $set: {
                    capturedBy: captor.id
                }
            };

            const filter = {
                username_id: member.username_id
            };

            return await this.updateOne(filter, data);
        },
        updateDateLastSummon: function (memberId, serveur_id) {
            const data = {
                $set: {
                    lastSummon: new Date()
                }
            };

            const filter = {
                username_id: memberId,
                serveur_id: serveur_id
            };

            return this.updateOne(filter, data);
        },
        updateDateCatchUser: function (memberId, serveur_id) {
            const data = {
                $set: {
                    lastCatch: new Date()
                }
            };

            const filter = {
                username_id: memberId,
                serveur_id: serveur_id
            };

            return this.updateOne(filter, data);
        },
        updateUserLevel: function (member, lvlUp, newXp) {
            let newLevel;

            if (lvlUp === true) { // Si l'utilisateur a atteint le niveau suivant
                newLevel = member.level + 1;
            } else {
                newLevel = member.level;
            }

            const data = {
                $set:{
                    level: newLevel,
                    xp: newXp,
                },
            };

            const filter = { username_id: member.username_id };

            return this.updateOne(filter, data);
        },
        updateMember: function (member, data) {
            const filter = { username_id: member.username_id };

            return this.updateOne(filter, data);
        },
        findByName: function(name) {
            return this.find({ name: name });
        }
    }
});

const Member = model('Member', memberSchema);

module.exports = Member;
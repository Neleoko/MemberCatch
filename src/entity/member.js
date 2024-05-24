const { model, Schema} = require('mongoose');

const memberSchema = new Schema({
    username_id: {
        type: String,
        required: true
    },
    guildId: {
        type: Schema.Types.ObjectId,
        ref: 'Guild',
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
        getAllMembers: function (guild) {
            return this.find({ guildId: guild._id });
        },
        getMemberDB: function (username_id, guild) {
            return this.findOne(
                {
                    username_id: username_id,
                    guildId: guild._id
                }
                );
        },
        getUserDiscord: function (username_id, client) {
            return client.users.cache.get(username_id);
        },
        getRandomMember: async function (username_id, guild) {
            const result = await this.aggregate([
                {
                    $match: {
                        guildId: guild._id,
                        username_id: { $ne: username_id }
                    }
                },
                { $sample: { size: 1 } }
            ]);
            return result[0];
        },
        getMembersWasCapturedBy: function (capturedBy, guild) {
            return this.find(
                {
                    capturedBy: capturedBy,
                    guildId: guild._id
                });
        },
        addNewUser: function (member, guild) {
            const newMember = new this({
                username_id: member.id,
                guildId: guild._id,
            });
            return newMember.save();
        },
        addCoins: function (member, coins, guild) {
            const data = {
                $inc: {
                    coins: coins
                }
            };

            const filter = {
                username_id: member.username_id,
                guildId: guild._id,
            };

            return this.updateOne(filter, data);
        },
        catchMember: async function (member, captor, guild) {
            const data = {
                $set: {
                    capturedBy: captor.id
                }
            };

            const filter = {
                username_id: member.username_id,
                guildId: guild._id,
            };

            return await this.updateOne(filter, data);
        },
        updateDateLastSummon: function (memberId, guild) {
            const data = {
                $set: {
                    lastSummon: new Date()
                }
            };

            const filter = {
                username_id: memberId,
                guildId: guild._id,
            };

            return this.updateOne(filter, data);
        },
        updateDateCatchUser: function (memberId, guild) {
            const data = {
                $set: {
                    lastCatch: new Date()
                }
            };

            const filter = {
                username_id: memberId,
                guildId: guild._id,
            };

            return this.updateOne(filter, data);
        },
        updateUserLevel: function (member, lvlUp, newXp, guild) {
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

            const filter = {
                username_id: member.username_id,
                guildId: guild._id,
            };

            return this.updateOne(filter, data);
        },
        updateCapturedBy: function (memberID, capturedBy, guild) {
            const filter = {
                username_id: memberID,
                guildId: guild._id,
            };
            const data = {
                $set: {
                    capturedBy: capturedBy
                }
            };

            return this.updateOne(filter, data);
        },
        updateCoins: function (member, guild, coins) {
            const data = {
                $set: {
                    coins: coins
                }
            };

            const filter = {
                username_id: member.username_id,
                guildId: guild._id,
            };

            return this.updateOne(filter, data);
        },
        findByName: function(name) {
            return this.find({ name: name });
        },
        releaseMember: function (member, guild) {
            const data = {
                $set: {
                    capturedBy: null
                }
            };

            const filter = {
                username_id: member.username_id,
                guildId: guild._id,
            };

            return this.updateOne(filter, data);
        },
        deleteMemberDB: function (member, guild) {
            return this.deleteOne(
                {
                    username_id: member.id,
                    guildId: guild._id
                }
            );
        },
    }
});

const Member = model('Member', memberSchema);

module.exports = Member;
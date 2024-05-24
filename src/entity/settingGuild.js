const { model, Schema} = require('mongoose');

const settingGuildSchema = new Schema({
    guildId: {
        type: Schema.Types.ObjectId,
        ref: 'Guild',
        required: true
    },
    channelLvlUp: {
        type: String,
        default: null
    },
    coinCost: {
        type: Number,
        default: 0
    },
    levelBaseXP: {
        type: Number,
        default: 100
    },
    ratioXP: {
        type: Number,
        default: 1.5
    },
}, {
    database: 'MemberCatch',
    collection: 'settingGuild',
    versionKey: false,
    statics: {
        async createSettingGuild(guild) {
            const settingGuild = new this({
                guildId: guild._id,
            });
            return await settingGuild.save();
        },
        async getSettingGuild(guild) {
            return await this.findOne({guildId: guild._id});
        },
        async setCoinCost(guild, coinCost) {
            const data = {
                $set:{
                    coinCost: coinCost,
                },
            };
            const filter = {
                guildId: guild._id,
            };
            return await this.updateOne(filter, data);
        },
        async setChannelLvlUp(guild, ChannelLvlUp) {
            const data = {
                $set:{
                    channelLvlUp: ChannelLvlUp,
                },
            };
            const filter = {
                guildId: guild._id,
            };
            return await this.updateOne(filter, data);
        },
        async setLevelBaseXP(guild, levelBaseXP) {
            const data = {
                $set:{
                    levelBaseXP: levelBaseXP,
                },
            };
            const filter = {
                guildId: guild._id,
            };
            return await this.updateOne(filter, data);
        },
        async setRatioXP(guild, ratioXP) {
            const data = {
                $set:{
                    ratioXP: ratioXP,
                },
            };
            const filter = {
                guildId: guild._id,
            };
            return await this.updateOne(filter, data);
        },
    }
})

module.exports = model('Setting', settingGuildSchema);
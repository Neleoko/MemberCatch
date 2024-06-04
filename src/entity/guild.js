const { model, Schema} = require('mongoose');

const guildSchema = new Schema({
    guildId: {
        type: String,
        required: true,
        // unique: true
    },
    name: {
        type: String,
        required: true
    },
}, {
    database: 'MemberCatch',
    collection: 'guilds',
    versionKey: false,
    statics: {
        async getGuildById(guildId) {
            return this.findOne({guildId});
        },
        async addNewGuild(guild) {
            const newGuild = new this({
                guildId: guild.id,
                name: guild.name,
            });
            return newGuild.save();
        }
    }
})

module.exports = model('Server', guildSchema);
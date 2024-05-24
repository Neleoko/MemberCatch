const Guild = require('../entity/guild');
const Member = require('../entity/member');
const SettingGuild = require('../entity/settingGuild');
module.exports = {
    name: 'guildCreate',
    once: false,
    async execute(client, guild) {
        let guildDB = await Guild.getGuildById(guild.id);
        if (!guildDB) {
            guildDB = await Guild.addNewGuild(guild);
            await SettingGuild.createSettingGuild(guildDB);
        }

        const membersDS = await guild.members.fetch();
        for (const member of membersDS.values()) {
            if (!member.user.bot) {
                if (!await Member.getMemberDB(member.id, guildDB)){
                    await Member.addNewUser(member, guildDB);
                }
            }
        }
    },
};

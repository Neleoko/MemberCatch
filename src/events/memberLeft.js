const Member = require('../entity/member');
const Guild = require('../entity/guild');

module.exports = {
    name: 'guildMemberRemove',
    once: false,
    async execute(client, member) {
        let guildDB = await Guild.getGuildById(member.guild.id);
        if (!member.user.bot) {
            let memberDB = await Member.getMemberDB(member.id, guildDB);
            if (memberDB){
                await Member.deleteMemberDB(member, guildDB);
            }
        }
    },
};
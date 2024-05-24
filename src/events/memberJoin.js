const Guild = require('../entity/guild');
const Member = require('../entity/member');
module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(client, member) {
        let guildDB = await Guild.getGuildById(member.guild.id);

        if (!member.user.bot) {
            let memberDB = await Member.getMemberDB(member.id, guildDB);
            if (!memberDB){
                await Member.addNewUser(member, guildDB);
            }
        }
    },
};

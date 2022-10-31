const { ApplicationCommandType } = require("discord.js");
const npcList = require("../../static/jsons/npc.json");

module.exports = {
    info: {
        name: "beg",
        description: "Beg for money",
        type: ApplicationCommandType.ChatInput
    },
    async execute(app, interaction, data, embed) {
        const {player} = data;
        if(player == null) return await interaction.reply("You don't have data to use this command!");
        if(player.cooldowns.get("beg") > interaction.createdTimestamp){
            await interaction.reply({content: `You can run **beg** <t:${Math.round(player.cooldowns.get("beg")/1000)}:R>`, ephemeral: true});
            return;
        }
        const npc = npcList.npcList[ app.utility.randomInt(0, npcList.npcList.length )];
        let copper = Math.floor(Math.random() * 101) + 10;
        let silver = 0;
        if(npc.goodReply){
            player.updateWallet(0, silver, copper);
            while(copper >= 100){
                silver += 1;
                copper -= 100;
            }
            if(silver > 0 && copper > 0){
                embed.addFields({name: `You begged ${npc.name} and recieved **${silver}** silver coin and **${copper}** copper coins!`, value: `${npc.goodReply}`});
            }else if( silver > 0 && copper <= 0){
                embed.addFields({name: `You begged ${npc.name} and recieved **${silver}** silver coin!`, value: `${npc.goodReply}`});
            }else if(silver <= 0 && copper > 0){
                embed.addFields({name: `You begged ${npc.name} and recieved **${copper}** copper coins!`, value: `${npc.goodReply}`});
            }
        }else{
            embed.addFields({name: `You begged ${npc.name} and got nothing.`, value: `${npc.badReply}`});
        }
        await player.updateOne({$set: {"cooldowns.beg": interaction.createdTimestamp + 120000}});
        await interaction.reply({embeds: [embed]});
        await player.save();
    }
}
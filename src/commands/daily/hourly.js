const { ApplicationCommandType } = require("discord.js");
const items = require("../../static/jsons/items.json");

module.exports = {
    info: {
        name: "hourly",
        description: "claim a reward every hour",
        type: ApplicationCommandType.ChatInput
    },
    async execute(app, interaction, data, embed){
        const {player} = data;
        if(player == null) return await interaction.reply("You don't have data to use this command!");
        if(player.cooldowns.get("hourly") > interaction.createdTimestamp){
            await interaction.reply({content: `You can run **hourly** <t:${Math.round(player.cooldowns.get("hourly")/1000)}:R>`, ephemeral: true});
            return;
        }
        const item = items.itemList[ app.utility.randomInt(0, items.itemList.length) ].name;
        player.updateInventory(item, 1);
        await player.updateOne({$set: {"cooldowns.hourly": interaction.createdTimestamp + 3600000}});
        await interaction.reply({content: `You recieved a(n) **${item.split("_").join(" ")}**!`});
        await player.save();
    }
}
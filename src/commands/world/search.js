const { ApplicationCommandType } = require("discord.js");
const items = require("../../static/jsons/items.json");

module.exports = {
    info: {
        name: "search",
        description: "search the area for a random item",
        type: ApplicationCommandType.ChatInput
    },
    async execute(app, interaction, data, embed){
        const {player} = data;
        if(player == null) return await interaction.reply("You don't have data to use this command!");
        const item = items.itemList[ app.utility.randomInt(0, items.itemList.length) ].name;
        player.updateInventory(item, 1);
        await interaction.reply(`You searched the area and collected a **${item.split("_").join(" ")}**!`);
        await player.save();
    }
}
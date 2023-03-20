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
        if(player.resting == true) return await interaction.reply("You are currently resting, you can't use other commands!");
        if(player.stamina < 15) return await interaction.reply("You don't have enough stamina, try resting for a bit!");
        if(player.cooldowns.get("search") > interaction.createdTimestamp){
            await interaction.reply({content: `You can run **search** <t:${Math.round(player.cooldowns.get("search")/1000)}:R>`, ephemeral: true});
            return;
        }
        const item = items.itemList[ app.utility.randomInt(0, items.itemList.length) ].name;
        const stam = 15;
        await player.updateStamina(-stam);
        await player.updateInventory(item, 1);
        await player.updateOne({$set: {"cooldowns.search": interaction.createdTimestamp + 35000}});
        await interaction.reply({content: `You searched the area and collected a(n) **${item.split("_").join(" ")}**!\n\`${player.stamina}/${player.maxStamina}\`\nYou lost ${stam} stamina`});
        await player.save();
    }
}
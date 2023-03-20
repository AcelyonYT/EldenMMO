const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
const materials = require("../../static/items/materials.json");

module.exports = {
    info: {
        name: "convert",
        description: "convert materials",
        type: ApplicationCommandType.ChatInput,
        options: [
            {
                name: "smelt",
                type: ApplicationCommandOptionType.Subcommand,
                description: "smelt ore",
                options: [
                    {
                        name: "item",
                        type: ApplicationCommandOptionType.String,
                        description: "The ore you want to smelt",
                        required: true
                    },
                    {
                        name: "amount",
                        type: ApplicationCommandOptionType.Number,
                        description: "The number of bars to make",
                        required: true
                    }
                ]
            },
            {
                name: "sand",
                type: ApplicationCommandOptionType.Subcommand,
                description: "sand wood",
                options: [
                    {
                        name: "item",
                        type: ApplicationCommandOptionType.String,
                        description: "The wood you want to sand",
                        required: true
                    },
                    {
                        name: "amount",
                        type: ApplicationCommandOptionType.Number,
                        description: "The number of wood to sand",
                        required: true
                    }
                ]
            },
            {
                name: "tanning",
                type: ApplicationCommandOptionType.Subcommand,
                description: "tan leather",
                options: [
                    {
                        name: "item",
                        type: ApplicationCommandOptionType.String,
                        description: "The skin you want to tan",
                        required: true
                    },
                    {
                        name: "amount",
                        type: ApplicationCommandOptionType.Number,
                        description: "The number of skin to tan",
                        required: true
                    }
                ]
            },
            {
                name: "mill",
                type: ApplicationCommandOptionType.Subcommand,
                description: "mill plants",
                options: [
                    {
                        name: "item",
                        type: ApplicationCommandOptionType.String,
                        description: "The plant you want to mill",
                        required: true
                    },
                    {
                        name: "amount",
                        type: ApplicationCommandOptionType.Number,
                        description: "The number of plant to mill",
                        required: true
                    }
                ]
            },
        ]
    },
    async execute(app, interaction, data, embed){
        let { player } = data;
        if(player == null) return await interaction.reply("You don't have data to use this command!");
        if(player.resting == true) return await interaction.reply("You are currently resting, you can't use other commands!");
        let subcommand = interaction.options.getSubcommand();
        let item = interaction.options.getString("item"); 
        let amount = interaction.options.getNumber("amount");
        if(amount <=  0) return await interaction.reply("You need a number greater than 0!");
        let fixedString = app.utility.upperCaseEachWord(item);
        convertMaterial(interaction, player, embed, fixedString, amount, subcommand);
    }
}
async function convertMaterial(interaction, player, embed, item, amount, subcommand) {
    let profession = subcommand == "smelt" ? "blacksmithing" : subcommand == "sand" ? "woodworking" : subcommand == "tanning" ? "leatherworking" : subcommand == "mill" ? "inscription" : undefined;
    if(player.professions.get(profession) == null) return await interaction.reply(`You need the ${profession} profession to use this command!`);
    let amountOfCoal = 0;
    if(subcommand == "smelt") {
        amountOfCoal = amount;
        if(!player.inventory.get("Coal")) return await interaction.reply("You need coal to smelt anything!");
        if(player.inventory.get("Coal") < amountOfCoal) return await interaction.reply(`You don't have enough coal to smelt ${amount} bars!`);
    }
    let amountOfItem = subcommand == "smelt" || subcommand == "tanning" ? amount * 5 : amount;
    let rawtype = subcommand == "smelt" ? "ore" : subcommand == "sand" ? "rough_wood" : subcommand == "tanning" ? "hide" : subcommand == "mill" ? "plant" : undefined;
    let refinedtype = subcommand == "smelt" ? "metal" : subcommand == "sand" ? "sanded_wood" : subcommand == "tanning" ? "leather" : subcommand == "mill" ? "ink" : undefined;
    let str = subcommand == "smelt" ? "smelting" : subcommand == "sand" ? "sanding" : subcommand == "tanning" ? "tanning" : subcommand == "mill" ? "milling" : undefined;
    let str1 = subcommand == "smelt" ? "smelted" : subcommand == "sand" ? "sanded" : subcommand == "tanning" ? "tanned" : subcommand == "mill" ? "milled" : undefined;
    let rawMaterialList = []; let refinedMaterialList =[]; let type;
    for(const item_ in materials){
        if(materials[item_].name == item && materials[item_].type == rawtype){
            type = materials[item_].type;
            rawMaterialList.push(materials[item_].name);
        }
        if(materials[item_].type == refinedtype){
            refinedMaterialList.push(materials[item_].name);
        }
    }
    if(type != rawtype) return await interaction.reply("You need to select raw material!\nSmelt: raw ore\nSand: rough wood\nTanning: hide\nMill: plants");
    if(!player.inventory.get(item)) return await interaction.reply(`You do not have ${item.split("_").join(" ")} in your inventory!`);
    if(player.inventory.get(item) < amountOfItem) return await interaction.reply(`You don't have enough ${item.split("_").join(" ")} to convert!`);
    await interaction.reply(`You begin ${str} ${item.split("_").join(" ")}...`);
    setTimeout(async function(){
        const index = rawMaterialList.indexOf(item);
        const material = refinedMaterialList[index];
        embed.setTitle(`${material.split("_").join(" ")}`).addFields(
            {name: `You ${str1} ${amountOfItem} ${item.split("_").join(" ")}${amountOfCoal == 0 ? "!" : " using " + amountOfCoal + " coal!"}`, value: `${amount} ${material.split("_").join(" ")} has been added to your inventory!`}
        );
        if(subcommand == "smelt") await player.updateInventory("Coal", -amountOfCoal);
        await player.updateInventory(item, -amountOfItem);
        await player.updateInventory(material, amount);
        await interaction.editReply({embeds: [embed]});
        await player.save();
    }, 5000);
}
const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, SelectMenuBuilder,
        ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const recipes = require('../../static/jsons/recipes.json');

module.exports = {
    info: {
        name: "craft",
        description: "craft items",
        type: ApplicationCommandType.ChatInput,
        options: [
            {
                name: "blacksmithing",
                type: ApplicationCommandOptionType.Subcommand,
                description: "view the blacksmith"
            },
            {
                name: "leatherworking",
                type: ApplicationCommandOptionType.Subcommand,
                description: "view the leather worker"
            },
            {
                name: "woodworking",
                type: ApplicationCommandOptionType.Subcommand,
                description: "view the carpenter"
            },
            {
                name: "alchemy",
                type: ApplicationCommandOptionType.Subcommand,
                description: "view the alchemist"
            },
            {
                name: "runecrafting",
                type: ApplicationCommandOptionType.Subcommand,
                description: "view the runecrafter"
            },
            {
                name: "cooking",
                type: ApplicationCommandOptionType.Subcommand,
                description: "view the chef"
            },
            {
                name: "survival",
                type: ApplicationCommandOptionType.Subcommand,
                description: "view the soldier"
            },
            {
                name: "firstaid",
                type: ApplicationCommandOptionType.Subcommand,
                description: "view the nurse"
            },
            {
                name: "tailoring",
                type: ApplicationCommandOptionType.Subcommand,
                description: "view the tailor"
            },
            {
                name: "jewelcrafting",
                type: ApplicationCommandOptionType.Subcommand,
                description: "view the jeweler"
            },
            {
                name: "engineering",
                type: ApplicationCommandOptionType.Subcommand,
                description: "view the engineer"
            },
            {
                name: "inscription",
                type: ApplicationCommandOptionType.Subcommand,
                description: "view the inscriptor"
            },
        ]
    },
    async execute(app, interaction, data, embed){
        let { player } = data;
        if(player == null) return await interaction.reply("You don't have data to use this command!");
        if(player.resting == true) return await interaction.reply("You are currently resting, you can't use other commands!");
        let subcommand = interaction.options.getSubcommand();
        if(player.professions.get(subcommand) == null) return await interaction.reply(`You need the ${subcommand} profession to use this command!`);
        const recipeList = recipes.recipebook.find(x => x.name == subcommand);
        if(player.recipes.length == 0) return await interaction.reply("You don't have any recipes!");
        let labels = []; let descriptions = []; let values = []; let embeds = [];
        for(const recipe of player.recipes){
            if(!recipeList.recipes.find(x => x.name == recipe.name)) continue;
            labels.push(recipe.name);
            descriptions.push(`craft ${recipe.name}`);
            values.push(recipe.name.toLowerCase());
            embeds.push(createNewEmbeds(recipe, 1));
        }
        if(labels.length == 0) return await interaction.reply("You don't have any recipes for that profession!");
        let buttonMenuRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("less")
                .setLabel("<<")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("more")
                .setLabel(">>")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("craft")
                .setLabel("Craft Item")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
                new ButtonBuilder()
                .setCustomId("multiply")
                .setLabel("x1")
                .setStyle(ButtonStyle.Primary)
        );
        let max = 2;
        if(labels.length < max){ 
            app.utility.disableButtonId(buttonMenuRow, "more");
            app.utility.disableButtonId(buttonMenuRow, "less"); 
        }
        let title = subcommand == "blacksmithing" ? "Blacksmith Forge" : subcommand == "leatherworking" ? "Tanning Bench" 
                    : subcommand == "woodworking" ? "Lumber Mill" : subcommand == "alchemy" ? "Potion Stand" : subcommand == "enchanting" ? "Enchanting Table"
                    : subcommand == "runecrafting" ? "Rune Alter" : subcommand == "cooking" ? "Fire Place" : subcommand == "survival" ? "Survival Kit"
                    : subcommand == "firstaid" ? "First Aid Kit" : subcommand == "tailoring" ? "Loom" : subcommand == "jewelcrafting" ? "Jewelary Table"
                    : subcommand == "engineering" ? "Work Bench" : subcommand == "inscription" ? "Writer's Table" : undefined;
        embed.setTitle(title).addFields({name: `Craft an item at the ${title}`, value: "Select an item to craft"});
        let selectMenuRow = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId("select")
                .setPlaceholder("Nothing")
        );
        let profession = player.professions.get(subcommand);
        let maxLvl = profession <= 50 ? 50 : profession >= 51 && profession <= 100 ? 100
                    : profession >= 101 && profession <= 150 ? 150 : undefined;
        let offset = 0;
        selectMenuRow = app.utility.addOptions(labels, descriptions, values, selectMenuRow, max, offset);
        let reply = await interaction.reply({embeds: [embed], components: [selectMenuRow, buttonMenuRow]});
        const filter = x => x.user.id === interaction.member.id;
        const collector = reply.createMessageComponentCollector({filter, idle: 300000});
        let curItem = false; let currentIndex = 0; let ableToCraft = false; let curRecipe = false; let multiplier = 1; let proExp = 5;
        collector.on("collect", async (x) => {
            let updatedPlayer = await app.db.users.findOne({id: interaction.member.id}).exec();
            let curProfession = updatedPlayer.professions.get(subcommand);
            switch(true){
                case x.customId == "select":
                    curItem = x.values.shift();
                    currentIndex = values.indexOf(curItem);
                    curRecipe = recipeList.recipes.find(x => x.name.toLowerCase() == curItem);
                    ableToCraft = checkMaterials(updatedPlayer, curRecipe.materials, multiplier);
                break;
                case x.customId == "more" || x.customId == "less":
                    curItem = false;
                    let newSelectMenuRow = new ActionRowBuilder().addComponents(
                        new SelectMenuBuilder()
                            .setCustomId("select")
                            .setPlaceholder("Nothing")
                    );
                    if(x.customId == "more") {
                        offset = offset + max > labels.length ? 0 : offset + max;
                        currentIndex = offset;
                    }else{
                        offset = offset - max < 0 ? labels.length - 1 : offset - max;
                        currentIndex = offset;
                    }
                    newSelectMenuRow = app.utility.addOptions(labels, descriptions, values, newSelectMenuRow, max, offset);
                    selectMenuRow = newSelectMenuRow;
                break;
                case x.customId == "multiply":
                    if(curItem == false){
                        await interaction.followUp("You need to select an item reciple first!");
                    }else{
                        embeds = [];
                        multiplier = multiplier == 1 ? 2 : multiplier == 2 ? 5 : multiplier == 5 ? 10 : 1;
                        proExp = proExp * multiplier;
                        buttonMenuRow.components[3].setLabel(`x${multiplier}`);
                        for(const recipe of player.recipes){
                            if(!recipeList.recipes.find(x => x.name == recipe.name)) continue;
                            embeds.push(createNewEmbeds(recipe, multiplier));
                        }
                        ableToCraft = checkMaterials(updatedPlayer, curRecipe.materials, multiplier);
                    }
                break;
                case x.customId == "craft":
                    if(curItem == false) {
                        await interaction.followUp("You need to select an item recipe first!");
                    }else{
                        for(const item in curRecipe.materials) {
                            await updatedPlayer.updateInventory(item, -(curRecipe.materials[item] * multiplier) );
                        }
                        await updatedPlayer.updateInventory(curRecipe.item, (1 * multiplier) );
                        await interaction.followUp({ content: `You created ${1 * multiplier} ${curRecipe.name} at the ${title}!`, ephemeral: true});
                        await interaction.followUp(`<@${updatedPlayer.id}> created ${1 * multiplier} ${curRecipe.name} at the ${title}!`);
                        if(curProfession < maxLvl) {
                            if(curProfession + proExp > maxLvl){
                                let tempExp = maxLvl - curProfession;
                                updatedPlayer.updateProfession(subcommand, tempExp);
                                await interaction.followUp(`${subcommand} has increased by **${tempExp}**. ${subcommand} is now **${updatedPlayer.professions.get(subcommand)}**`);
                            }else{
                                updatedPlayer.updateProfession(subcommand, proExp);
                                await interaction.followUp(`${subcommand} has increased by **${proExp}**. ${subcommand} is now **${updatedPlayer.professions.get(subcommand)}**`);
                            }
                        }
                        ableToCraft = checkMaterials(updatedPlayer, curRecipe.materials, multiplier);
                        await updatedPlayer.save();
                    }
                break;
            }
            if(ableToCraft){
                app.utility.enableButtonId(buttonMenuRow, "craft");
            }else{
                app.utility.disableButtonId(buttonMenuRow, "craft");
            }
            selectMenuRow.components[0].setPlaceholder(curItem != false ? `${curItem}` : "Nothing");
            await x.update({embeds: [embeds[currentIndex]], components: [selectMenuRow, buttonMenuRow]})
        });
        collector.on("end", async() => {
            return await interaction.followUp("There was no recent interactions, closing the menu.");
        });
    }
}
function checkMaterials(player, materials, multiplier) {
    for(const item in materials){ 
        if( ( !player.inventory.get(item) ? 0 : player.inventory.get(item) ) < (materials[item] * multiplier) ) { return false; }
    }
    return true;
}
function createNewEmbeds(recipe, multiplier) {
    let newEmbed = new EmbedBuilder().setTitle(`${recipe.name}`).addFields({name: `Info`, value: `Tier: ${recipe.tier}`});
    let materialArr = []; let valueArr = [];
    for(const [key, value] of recipe.materials){ materialArr.push(`${key.split("_").join(" ")}: ${value * multiplier}`); }
    for(const [key, value] of recipe.value){ valueArr.push(`${key.split("_").join(" ")}: ${value}`); }
    newEmbed.addFields({name: "Materials", value: `${materialArr.join("\n")}`});
    newEmbed.addFields({name: "Sell Value", value: `${valueArr.join("\n")}`});
    return newEmbed;
}
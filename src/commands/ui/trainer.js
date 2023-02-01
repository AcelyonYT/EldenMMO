const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, 
    ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle } = require("discord.js");
const professionList = require("../../static/jsons/professions.json");
const recipes = require("../../static/jsons/recipes.json");

module.exports = {
    info: {
        name: "trainer",
        description: "View trainers and see what you can do.",
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
                name: "mining",
                type: ApplicationCommandOptionType.Subcommand,
                description: "view the miner"
            },
            {
                name: "herbalism",
                type: ApplicationCommandOptionType.Subcommand,
                description: "view the herbologist"
            },
            {
                name: "alchemy",
                type: ApplicationCommandOptionType.Subcommand,
                description: "view the alchemist"
            },
            {
                name: "enchanting",
                type: ApplicationCommandOptionType.Subcommand,
                description: "view the enchanter"
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
                name: "fishing",
                type: ApplicationCommandOptionType.Subcommand,
                description: "view the fisherman"
            },
            {
                name: "logging",
                type: ApplicationCommandOptionType.Subcommand,
                description: "view the lumberjack"
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
                name: "skinning",
                type: ApplicationCommandOptionType.Subcommand,
                description: "view the skinner"
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
        let {player} = data;
        if(player == null) return await interaction.reply("You don't have data to use this command!");
        let subcommand = interaction.options.getSubcommand();
        sendTrainerEmbed(app, interaction, embed, player, subcommand);
    }
}

async function sendTrainerEmbed(app, interaction, embed, player, profession){
    const curProfession = professionList.profession.find(x => x.name == profession);
    const fixedString = profession[0].toUpperCase() + profession.substring(1);
    if(player.professions.get(profession) == null){
        buyProfession(app, interaction, embed, profession, curProfession, fixedString);
    }else{
        showProfession(app, interaction, embed, player, profession, curProfession, fixedString);
    }
}
async function buyProfession(app, interaction, embed, profession, curProfession, fixedString) {
    const limitedProfessions = [
        "blacksmithing", "leatherworking", "woodworking", "mining", "herbalism", "alchemy",
        "enchanting", "runecrafting", "logging", "skinning", "tailoring", "jewelcrafting",
        "engineering", "inscription"
    ];
    const purchaseProfessionEmbed = new EmbedBuilder().setTitle(`${fixedString} Profession`).addFields(
        {name: "What does this profession do?", value: `${curProfession.description}`},
        {name: "What is recommonded when using this profession?", value: `${curProfession.recommended}`},
        {name: "How much will it be to learn this profession?", value: `**${curProfession.priceToLearn.silver}** Silver Coin`}
    );
    const buttonMenuRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("buy")
            .setLabel("Buy Profession")
            .setStyle(ButtonStyle.Primary)
    );
    const reply = await interaction.reply({embeds: [purchaseProfessionEmbed], components: [buttonMenuRow]});
    const filter = x => x.user.id === interaction.member.id;
    const collector = reply.createMessageComponentCollector({filter, idle: 120000});
    collector.on("collect", async (x) => {
        let updatedPlayer = await app.db.users.findOne({id: interaction.member.id}).exec();
        if(updatedPlayer.wallet.get("silver") < 1) {
            await interaction.followUp({content: "You don't have enough silver to buy this profession!", ephemeral: true});
            await x.update({components: [buttonMenuRow]});
        }else{
            if(limitedProfessions.find(x => x == profession)){
                let numOfPro = 0;
                for( let i = 0; i < limitedProfessions.length; i++){
                    if(numOfPro == 2){
                        await x.update({components: []});
                        return await interaction.followUp({content: "You cannot purchase this profession. You already have 2 skill professions."});
                    }
                    if(updatedPlayer.professions.get(limitedProfessions[i]) == null){
                        continue;
                    }
                    numOfPro += 1;
                }
            }
            await updatedPlayer.updateWallet(0, -1, 0);
            await updatedPlayer.professions.set(`${profession}`, 0);
            embed.setTitle(`${fixedString} Profession`)
            .addFields(
                {name: "You purchased this profession!", value: "Run the command again to view your profession!"}
            );
            let proCommand = ["chop", "mine", "fish", "gather", "skin", "hunt"];
            let command = ["logging", "mining", "fishing", "herbalism", "skinning", "survival"]
            for(let i = 0; i < command.length; i++){
                if(profession != command[i]) continue;
                await updatedPlayer.cooldowns.set(`${proCommand[i]}`, interaction.createdTimestamp);
                await interaction.followUp({content: `You gain the \`${proCommand[i]}\` command!`, ephemeral: true});
            }
            await updatedPlayer.save();
            return await x.update({embeds: [embed], components: []});
        }
    });
    collector.on("end", async() => {
        return await interaction.followUp("There was no recent interactions, closing the menu.");
    });
}
async function showProfession(app, interaction, embed, player, profession, curProfession, fixedString) {
    let index = 0;
    let professionVal = player.professions.get(profession);
    let {tier, maxLvl, costOfNextTier, costString} = findTier(professionVal, curProfession);
    let professionEmbed = createEmbed(player, fixedString, professionVal, maxLvl, tier, curProfession, costString);
    const buttonMenuRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("back")
            .setLabel("<<")
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId("forward")
            .setLabel(">>")
            .setStyle(ButtonStyle.Primary)
    );
    const buyButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("buyTier")
            .setLabel("Buy Tier")
            .setStyle(ButtonStyle.Primary)
    );
    const buyRecipe = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("buyRecipe")
            .setLabel("Buy Recipe")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
    );
    const buyEnchant = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("buyEnchant")
            .setLabel("Buy Enchantment")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
    )
    const gatheringProfessions = ["logging", "herbalism", "mining", "skinning", "fishing"];
    let reply;
    if(gatheringProfessions.find(x => x == curProfession.name)){
        reply = await interaction.reply({embeds: [professionEmbed[0]], components: [buyButton]});
    }else{
        reply = await interaction.reply({embeds: [professionEmbed[0]], components: [buttonMenuRow, buyButton]});
    }
    const filter = x => x.user.id === interaction.member.id;
    const collector = reply.createMessageComponentCollector({filter, idle: 300000});
    let curItem;
    collector.on("collect", async (x) => {
        let updatedPlayer = await app.db.users.findOne({id: interaction.member.id}).exec();
        let newEmbed = professionEmbed[index];
        let recipeArr = recipes.recipebook.find(x => x.name == curProfession.name);
        let item;
        if(recipeArr.enchantments == null){
            item = recipeArr.recipes.find(x => x.name.toLowerCase() == curItem) ? recipeArr.recipes.find(x => x.name.toLowerCase() == curItem) : false;
        }else{
            item = recipeArr.enchantments.find(x => x.name.toLowerCase() == curItem) ? recipeArr.enchantments.find(x => x.name.toLowerCase() == curItem) : false;
        }
        let copper; let silver; let gold;
        if(item == false){
            copper = 0; silver = 0; gold = 0;
        }else{
            copper = item.value.copper ? item.value.copper : 0; silver = item.value.silver ? item.value.silver : 0; gold = item.value.gold ? item.value.gold : 0;
        }
        let curCop = updatedPlayer.wallet.get("copper"); let curSil = updatedPlayer.wallet.get("silver"); let curGold = updatedPlayer.wallet.get("gold")
        let newCopVal = -copper; let newSilVal = -silver; let newGoldVal = -gold;
        switch(true){
            case x.customId == "buyTier":
                if(updatedPlayer.professions.get(profession) != maxLvl){
                    await interaction.followUp({content: "Your Profession needs to be max level to buy the next tier!",  ephemeral: true});
                    break; // idk if that will break correctly
                }
                if(tier == 3){
                    await interaction.followUp({content: "You're already max tier!",  ephemeral: true});
                    break;
                }
                if(updatedPlayer.wallet.get("silver") < costOfNextTier){
                    await interaction.followUp({content: "You don't have enough silver to buy the next tier!", ephemeral: true});
                    break;
                }
                await updatedPlayer.updateWallet(0, -costOfNextTier, 0);
                await updatedPlayer.updateProfession(profession, 5);
                await interaction.followUp({content: `You increased your professions tier to **${tier + 1}**.`,  ephemeral: true});
                await interaction.followUp(`<@${updatedPlayer.id}> increased their profession tier to **${tier + 1}**.`);
                professionVal = updatedPlayer.professions.get(profession);
                ({tier, maxLvl, costOfNextTier, costString} = findTier(professionVal, curProfession));
                professionEmbed = createEmbed(updatedPlayer, fixedString, updatedPlayer.professions.get(profession), maxLvl, tier, curProfession, costString);
                await updatedPlayer.save();
            break;
            case x.customId == "back":
                if( index == 0){
                    index = professionEmbed.length - 1;
                }else{
                    index = index - 1;
                }
            break;
            case x.customId == "forward":
                if(index == (professionEmbed.length - 1)){
                    index = 0;
                }else{
                    index = index + 1;
                }
            break;
            case x.customId == "buyRecipe":
                if(curItem == false){
                    await interaction.followUp({content: "You need to select an item first!", ephemeral: true});
                    break;
                }
                if(tier < item.tier){
                    await interaction.followUp({content: "Your tier isn't high enough to purchase that recipe!", ephemeral: true});
                    break;
                }
                removeCoins(updatedPlayer, copper, silver, gold, interaction, curCop, curSil, curGold, newCopVal, newSilVal, newGoldVal);
                updatedPlayer.updateRecipes(item.name, item.tier, item.materials, item.item, item.value);
                await interaction.followUp({content: `You bought **${item.name}** Recipe!`, ephemeral: true});
                await interaction.followUp({content: `<@${updatedPlayer.id}> bought **${item.name}** Recipe!`});
                curItem = false;
                professionEmbed = createEmbed(updatedPlayer, fixedString, updatedPlayer.professions.get(profession), maxLvl, tier, curProfession, costString);
                await updatedPlayer.save();
            break;
            case x.customId == "buyEnchant":
                if(curItem == false){
                    await interaction.followUp({content: "You need to select an item first!"});
                    break;
                }
                if(tier < item.tier){
                    await interaction.followUp({content: "Your tier isn't high enough to purchase that recipe!", ephemeral: true});
                    break;
                }
                removeCoins(updatedPlayer, copper, silver, gold, interaction, curCop, curSil, curGold, newCopVal, newSilVal, newGoldVal);
                updatedPlayer.updateEnchantments(item.name, item.tier, item.enchant, item.value);
                await interaction.followUp({content: `You bought **${item.name}** Enchantment!`, ephemeral: true});
                await interaction.followUp({content: `<@${updatedPlayer.id}> bought **${item.name}** Enchantment!`});
                curItem = false;
                professionEmbed = createEmbed(updatedPlayer, fixedString, updatedPlayer.professions.get(profession), maxLvl, tier, curProfession, costString);
                await updatedPlayer.save();
            break;
            case x.componentType == 3: // select menu
                curItem = x.values.shift();
                if(curProfession.name == "enchanting"){
                    app.utility.enableButtons(buyEnchant);
                }else{
                    app.utility.enableButtons(buyRecipe);
                }
            break;
        };
        if(index == 0){
            if(gatheringProfessions.find(x => x == curProfession.name)){
                await x.update({embeds: [professionEmbed[0]], components: [buyButton]});
            }else{
                await x.update({embeds: [professionEmbed[0]], components: [buttonMenuRow, buyButton]});
            }
        }else{
            if(professionEmbed.length == 1){
                index = 0;
                newEmbed = professionEmbed[index];
                await x.update({embeds: [newEmbed], components: [buttonMenuRow, buyButton]});
            }else{
                let selectMenuArr = [];
                let offset = 0;
                let labels = []; let values = []; let descriptions = [];
                if(curProfession.name == "enchanting"){
                    ({labels, values, descriptions} = pushToArray(updatedPlayer, recipeArr.enchantments, labels, values, descriptions, "enchantment"));
                }else{
                    ({labels, values, descriptions} = pushToArray(updatedPlayer, recipeArr.recipes, labels, values, descriptions, "recipe"));
                }
                for(let i = 0; i < professionEmbed.length; i++){
                    let selectMenuRow = new ActionRowBuilder().addComponents(
                        new SelectMenuBuilder()
                            .setCustomId(`select${i}`)
                            .setPlaceholder(`Nothing Selected`)
                    );
                    selectMenuRow = addOptions(labels, values, descriptions, selectMenuRow, 6, offset);
                    selectMenuArr.push(selectMenuRow);
                    offset = offset + 6;
                }
                if(professionEmbed.length != selectMenuArr.length){
                    selectMenuArr.pop();
                    index = index - 1
                }
                newEmbed = professionEmbed[index] ? professionEmbed[index] : professionEmbed[ index == 0 ? index : index - 1];
                let actionRow = selectMenuArr[index - 1] ? selectMenuArr[index - 1] : selectMenuArr[index == 0 ? index : index - 2];
                actionRow.components[0].setPlaceholder(curItem ? `${curItem}` : "Nothing Selected");
                if(curProfession.name == "enchanting"){
                    await x.update({embeds: [newEmbed], components: [actionRow, buttonMenuRow, buyEnchant]});
                }else{
                    await x.update({embeds: [newEmbed], components: [actionRow, buttonMenuRow, buyRecipe]});
                }
            }
        }
    });
    collector.on("end", async() => {
        return await interaction.followUp("There was no recent interactions, closing the menu.");
    });
}
function createEmbed(player, fixedString, professionVal, maxLvl, tier, curProfession, costString){
    const embedArray = [];
    let recipeArr = recipes.recipebook.find(x => x.name == curProfession.name);
    let titleName;
    if(recipeArr.enchantments == null){
        recipeArr = recipeArr.recipes;
        titleName = `Recipes`;
    }else{
        recipeArr = recipeArr.enchantments;
        titleName = `Enchantments`
    }
    let newArr = [];
    for( let i = 0; i < recipeArr.length; i++){
        if(player.recipes.find(x => x.name == recipeArr[i].name) || player.enchantments.find(x => x.name == recipeArr[i].name)){
            continue;
        }
        newArr.push(recipeArr[i]);
    }
    let count = 0; let index = 1;
    const professionEmbed = new EmbedBuilder().setTitle(`${fixedString} Profession`).addFields(
        {name: `Profession Level: **\`${professionVal}/${maxLvl}\`**`, value: `Tier Level: **\`${tier}\`**`},
        {name: "What does this profession do?", value: `${curProfession.description}`},
        {name: "What is recommonded when using this profession?", value: `${curProfession.recommended}`},
        {name: "How much to pay for the next tier?", value: `**${costString}**`}
    );
    embedArray.push(professionEmbed);
    for( let i = 0; i < newArr.length; i++){
        if(i == (0 + count)){
            let embed = new EmbedBuilder().setTitle(`Select A ${titleName} To Buy`);
            embedArray.push(embed);
            count = count + 6
            if(count == 6){
                index = 1;
            }else{
                index++;
            }
        }
        let string = ``;
        if(newArr[i].materials != null){
            let arrName = Object.keys(newArr[i].materials); let arrNum = Object.values(newArr[i].materials);
            for(let j = 0; j < arrName.length; j++){
                string = string + ` ${arrName[j]}: ${arrNum[j]}\n`;
            }
        }else{
            string = `No Materials`;
        }
        let arrName2 = Object.keys(newArr[i].value); let arrNum2 = Object.values(newArr[i].value);
        let string2 = ``;
        for(let k = 0; k < arrName2.length; k++){
            string2 = string2 + `${arrName2[k]}: ${arrNum2[k]}\n`;
        }
        if(i < count) embedArray[index].addFields({name: `${newArr[i].name}`, value: `Tier: \`${newArr[i].tier}\`\nMaterials:\n \`${string}\`\nValue:\n \`${string2}\``, inline: true});
    }
    return embedArray;
}
function findTier(professionVal, curProfession) {
    let tier, maxLvl, costOfNextTier, costString;
    switch(true){
        case professionVal <= 50:
            tier = 1; maxLvl = 50; 
            costOfNextTier = curProfession.priceOfNextTier.tier2.silver; costString = `${curProfession.priceOfNextTier.tier2.silver} Silver Coins`;
        break;
        case professionVal >= 51 && professionVal <= 100:
            tier = 2; maxLvl = 100; 
            costOfNextTier = curProfession.priceOfNextTier.tier3.silver; costString =`${curProfession.priceOfNextTier.tier3.silver} Silver Coin`;
        break;
        case professionVal >= 101 && professionVal <= 150:
            tier = 3; maxLvl = 150; costOfNextTier = 0; costString = "Max Tier";
        break;
    }
    return {tier, maxLvl, costOfNextTier, costString};
}
function addOptions(labels, values, descriptions, selectMenuRow, max, offset){
    for(let i = 0; i < labels.length; i++){
        let newIndex = i + offset;
        if(i > (max - 1)){
            continue;
        }
        if(!labels[newIndex]){
            break;
        }
        selectMenuRow.components[0].addOptions(
            {
                label: labels[newIndex],
                description: descriptions[newIndex],
                value: values[newIndex]
            }
        );
    }
    return selectMenuRow;
}
function pushToArray(player, array, labels, values, descriptions, string){
    let removeIndex;
    for( let i = 0; i < array.length; i++){
        if(player.recipes.find(x => x.name == array[i].name) || player.enchantments.find(x => x.name == array[i].name)){
            removeIndex = array.indexOf(array[i]);
            array.splice(removeIndex, 1);
        }
    }
    for(let i  = 0; i < array.length; i++){
        labels.push(array[i].name);
        descriptions.push(`Buy ${array[i].name} ${string}!`);
        values.push(array[i].name.toLowerCase());
    }
    return {labels, values, descriptions};
}
async function removeCoins(updatedPlayer, copper, silver, gold, interaction, curCop, curSil, curGold, newCopVal, newSilVal, newGoldVal){
    if((updatedPlayer.wallet.get("copper") < copper && updatedPlayer.wallet.get("silver") < silver && updatedPlayer.wallet.get("gold") == 0) || (updatedPlayer.wallet.get("copper") == 0 && updatedPlayer.wallet.get("silver") == 0 && updatedPlayer.wallet.get("gold") == 0)){
        await interaction.followUp({content: "You don't have enough coins to buy that recipe!", ephemeral: true});
    }else{
        if((curCop < copper || curSil <= silver)){
            await updatedPlayer.updateWalletConvertHighToLow(copper, silver, gold, curCop, curSil, curGold, newCopVal, newSilVal, newGoldVal);
        }else{
            await updatedPlayer.updateWallet(gold, newSilVal, newCopVal);
        }
    }
}
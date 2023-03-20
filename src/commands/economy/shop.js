const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, 
    SelectMenuBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const weapons = require("../../static/items/weapons.json");
const materials = require("../../static/items/materials.json");
const bait = require("../../static/items/bait.json");

let embeds = [];
let actionRows = [];
let count = 0;
let i = 0;
let index;
let offset = 0;
let maxItem = 0;
let embedIndex = 0;

module.exports = {
    info: {
        name: "shop",
        description: "Opens up a shop",
        type: ApplicationCommandType.ChatInput,
        options: [
            {
                name: "weapon",
                description: "opens the weapon shop",
                type: ApplicationCommandOptionType.Subcommand
            },
            {
                name: "materials",
                description: "opens the materials shop",
                type: ApplicationCommandOptionType.Subcommand
            },
            {
                name: "bait",
                description: "opens the bait shop",
                type: ApplicationCommandOptionType.Subcommand
            },
            {
                name: "sell",
                description: "Sell an item",
                type: ApplicationCommandOptionType.Subcommand
            }
        ]
    },
    async execute(app, interaction, data, embed){
        const {player} = data;
        if(player == null) return await interaction.reply("You don't have data to use this command!");
        if(player.resting == true) return await interaction.reply("You are currently resting, you can't use other commands!");
        const subcommand = interaction.options.getSubcommand();
        switch(subcommand){
            case "weapon":
                openShop(app, interaction, embed, weapons, "Weapons");
            break;
            case "materials":
                openShop(app, interaction, embed, materials, "Materials");
            break;
            case "bait":
                openShop(app, interaction, embed, bait, "Bait");
            break;
            case "sell":
                sell(app, interaction, player);
            break;
        }
    }
}
async function sell(app, interaction, player){
    let itemString;
    let labels = []; let descriptions = []; let values = [];
    embeds = [];
    maxItem = 0;
    actionRows = [];
    embedIndex = 0;
    count = 0;
    i = 0;
    index;
    offset = 0;
    for(const [key, value] of player.inventory){
        if(value <= 0){
            player.inventory.delete(key);
        }else{
            const item = app.items.items.get(key);
            if(item.value.sell){
                const name = item.displayName;
                itemString = `**${name} ─ ${value}**`;
                labels.push(`${name}`);
                descriptions.push(`Sell a(n) ${name}`);
                values.push(`${item.lowerCaseName}`);
                maxItem++;
                createEmbeds(itemString, item);
            }else{
                continue;
            }
        }
    }
    await player.save();
    const noItemEmbed = new EmbedBuilder().setTitle(`Oh No!`);
    noItemEmbed.addFields({name: `**No Items**`, value: `You don't have any items to sell!`});
    let sellItem;
    let selectMenuRow;
    for(let j = 0; j < embeds.length; j++){
        selectMenuRow = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId(`select${j}`)
                .setPlaceholder("Nothing selected")
        );
        selectMenuRow = addOptionsToMenu(labels, descriptions, values, selectMenuRow, 4, offset);
        actionRows.push(selectMenuRow);
        offset += 4;
    }
    offset = 0;
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
    const buttonMenuRow2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("sell")
            .setLabel("Sell")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
    );
    let reply;
    if(embeds.length == 0){
        reply = await interaction.reply({embeds: [noItemEmbed]});
        return;
    }else{
        reply = await interaction.reply({embeds: [embeds[0]], components: [actionRows[0], buttonMenuRow, buttonMenuRow2], fetchReply: true, ephemeral: true});
    }
    const filter = x => x.user.id === interaction.member.id;
    const collector = reply.createMessageComponentCollector({filter, idle: 60000});
    let soldItem;
    collector.on("collect", async (x) => {
        let updatedPlayer = await app.db.users.findOne({id: interaction.member.id}).exec();
        switch(x.componentType){
            case 3: // select menu
                sellItem = x.values.shift();
                app.utility.enableButtons(buttonMenuRow2);
            break;
            case 2: // button
                if(x.customId == "back" || x.customId == "forward"){
                    if(x.customId == "forward"){
                        if(embedIndex == (embeds.length - 1)){
                            offset = 0;
                        }else{
                            offset = offset + 4
                        }
                    }else{
                        if(embedIndex == 0){
                            offset = maxItem - 4
                        }else{
                            offset = offset - 4;
                        }
                    }
                    action(x, embeds);
                }else{
                    for(let [key, value] of updatedPlayer.inventory){
                        const item = app.items.items.get(key);
                        if(sellItem == item.lowerCaseName){
                            soldItem = key;
                            let copper = item.value.sell.copper ? item.value.sell.copper : 0;
                            let silver = item.value.sell.silver ? item.value.sell.silver : 0;
                            let gold = item.value.sell.gold ? item.value.sell.gold : 0;
                            updatedPlayer.updateWallet(gold, silver, copper);
                            updatedPlayer.updateInventory(item.name, -1);
                            value = value - 1;
                            if(value <= 0){
                                let tempIn = labels.indexOf(`${item.displayName}`);
                                let tempDe = descriptions.indexOf(`Sell a(n) ${item.displayName}`);
                                let tempVa = values.indexOf(`${item.lowerCaseName}`);
                                labels.splice(tempIn, 1);
                                descriptions.splice(tempDe, 1);
                                values.splice(tempVa, 1);
                                let _offset = 0;
                                actionRows = [];
                                for(let j = 0; j < embeds.length; j++){
                                    selectMenuRow = new ActionRowBuilder().addComponents(
                                        new SelectMenuBuilder()
                                            .setCustomId(`select${j}`)
                                            .setPlaceholder("Nothing selected")
                                    );
                                    selectMenuRow = addOptionsToMenu(labels, descriptions, values, selectMenuRow, 4, _offset);
                                    actionRows.push(selectMenuRow);
                                    _offset = _offset + 4;
                                }
                                sellItem = false;
                            }
                            await interaction.followUp({content: `You sold a(n) ${item.displayName}!`, ephemeral: true});
                            await interaction.followUp({content: `<@${updatedPlayer.id}> sold a(n) ${item.displayName}!`});
                        }
                    }
                    embeds = [];
                    i = 0;
                    count = 0;
                    index = 0;
                    for(const [key, value] of updatedPlayer.inventory){
                        const item = app.items.items.get(key);
                        if(item.value.sell){
                            maxItem = 0;
                            itemString = `**${item.displayName} ─ ${value}**`;
                            maxItem += 1;
                            createEmbeds(itemString, item);
                        }
                    }
                    await updatedPlayer.save();
                }
            break;
        }
        if(embeds.length != actionRows.length){
            actionRows.pop();
            embedIndex = embedIndex - 1;
        }
        if(embeds.length == 0){
            await x.update({embeds: [noItemEmbed], components: []});
            return;
        }else{
            let embed = embeds[embedIndex] ? embeds[embedIndex] : embeds[ embedIndex == 0 ? embedIndex : embedIndex - 1];
            let act = actionRows[embedIndex] ? actionRows[embedIndex] : actionRows[ embedIndex == 0 ? embedIndex : embedIndex - 1];
            act.components[0].setPlaceholder(sellItem ? `${sellItem}` : "Nothing selected");
            await x.update({embeds: [embed], components: [act, buttonMenuRow, buttonMenuRow2]});
        }
    });
    collector.on("end", async() => {
        buttonMenuRow.components.map(x => x.setDisabled(true));
        buttonMenuRow2.components.map(x => x.setDisabled(true));
        selectMenuRow.components.map(x => x.setDisabled(true));
        await interaction.followUp("You ran out of time!");
    });
}
function createEmbeds(itemString, item){
    if(i == (0 + count)){
        let embed = new EmbedBuilder().setTitle(`Select An Item To Sell`);
        embeds.push(embed);
        count = count + 4;
        if(count == 4){
            index = 0;
        }else{
            index++;
        }
    }
    if(i < count) embeds[index].addFields({name: `${itemString}`, value: `${item.group}`});
    i += 1;
}
async function action(component, embeds){
    switch(component.customId){
        case "back":
            if(embedIndex == 0){
                embedIndex = embeds.length - 1;
            }else{
                embedIndex = embedIndex - 1;
            }
        break;
        case "forward":
            if(embedIndex == embeds.length - 1){
                embedIndex = 0
            }else{
                embedIndex = embedIndex + 1;
            }
        break;
    }
}
async function openShop(app, interaction, embed, itemType, type){
    embed.setTitle(`${type} Shop`);
    let itemToBuy = []; let labels = []; let descriptions = []; let values = [];
    for(const item in itemType){
        if(itemType[item].value.buy){
            labels.push(`${item.split("_").join(" ")}`);
            descriptions.push(`Buy a(n) ${item.split("_").join(" ")}`);
            values.push(`${item.toLowerCase()}`);
            if(itemType[item].value.buy.copper && !itemType[item].value.buy.silver){
                itemToBuy.push(`**${item.split("_").join(" ")}**.....**${itemType[item].value.buy.copper}** copper coins`);
            }else if(itemType[item].value.buy.copper && itemType[item].value.buy.silver){
                itemToBuy.push(`**${item.split("_").join(" ")}**.....**${itemType[item].value.buy.silver}** silver and **${itemType[item].value.buy.copper}** copper coins`);
            }
        }else{
            continue;
        }
    }
    embed.addFields({name: `${type}`, value: itemToBuy.join("\n")});
    let selectMenuRow = new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
            .setCustomId("select")
            .setPlaceholder("Nothing selected")  
    );
    selectMenuRow = addOptionsToMenu(labels, descriptions, values, selectMenuRow, labels.length, 0, "");
    const buttonMenuRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
                .setCustomId("buy")
                .setLabel("Buy")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)
    );
    let reply = await interaction.reply({embeds: [embed], components: [selectMenuRow, buttonMenuRow], fetchReply: true, ephemeral: true});
    const filter = x => x.user.id === interaction.member.id;
    const collector = reply.createMessageComponentCollector({filter, idle: 60000});
    let buyItem;
    collector.on("collect", async (x) => {
        let updatedPlayer = await app.db.users.findOne({id: interaction.member.id}).exec();
        switch(x.componentType){
            case 3: // Select Menu
                buyItem = x.values.shift();
                app.utility.enableButtons(buttonMenuRow);
            break;
            case 2: // Button
                if(buyItem){
                    for( const item in itemType){
                        if(buyItem == item.toLowerCase()){
                            let copper = itemType[item].value.buy.copper ? itemType[item].value.buy.copper : 0;
                            let silver = itemType[item].value.buy.silver ? itemType[item].value.buy.silver : 0;
                            let gold = itemType[item].value.buy.gold ? itemType[item].value.buy.gold : 0;
                            if((updatedPlayer.wallet.get("copper") < copper && updatedPlayer.wallet.get("silver") < silver && updatedPlayer.wallet.get("gold") == 0) || (updatedPlayer.wallet.get("copper") == 0 && updatedPlayer.wallet.get("silver") == 0 && updatedPlayer.wallet.get("gold") == 0)){
                                await interaction.followUp({content: `You don't have enough coins to pay for ${item.split("_").join(" ")}!`, ephemeral: true});
                            }else{
                                let curCop = updatedPlayer.wallet.get("copper");
                                let curSil = updatedPlayer.wallet.get("silver");
                                let curGold = updatedPlayer.wallet.get("gold");
                                let newCopVal = -copper;
                                let newSilVal = -silver;
                                let newGoldVal = -gold;
                                if((curCop < copper || curSil <= silver)){
                                    await updatedPlayer.updateWalletConvertHighToLow(copper, silver, gold, curCop, curSil, curGold, newCopVal, newSilVal, newGoldVal);
                                }else{
                                    await updatedPlayer.updateWallet(gold, newSilVal, newCopVal);
                                }
                                updatedPlayer.updateInventory(itemType[item].name, 1);
                                await interaction.followUp({content: `You bought a(n) ${item.split("_").join(" ")}!`, ephemeral: true});
                                await interaction.followUp(`<@${updatedPlayer.id}> bought ${item.split("_").join(" ")}`);
                                await updatedPlayer.save();
                            }
                        }
                    }
                }
            break;
        }
        selectMenuRow.addComponents(
            new SelectMenuBuilder()
            .setCustomId("select")
            .setPlaceholder(buyItem ? `${buyItem}` : "Nothing selected")
        )
        selectMenuRow.components.shift();
        selectMenuRow = addOptionsToMenu(labels, descriptions, values, selectMenuRow, labels.length, 0, "");
        await x.update({components: [selectMenuRow, buttonMenuRow]});
    });
    collector.on("end", async() => {
        buttonMenuRow.components.map(x => x.setDisabled(true));
        selectMenuRow.components.map(x => x.setDisabled(true));
        await interaction.followUp("You ran out of time!");
    });
}
function addOptionsToMenu(labels, descriptions, values, selectMenuRow, max, offset){
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
        )
    }
    return selectMenuRow;
}
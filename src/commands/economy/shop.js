const { ApplicationCommandType, ApplicationCommandOptionType, 
    SelectMenuBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const weapons = require("../../static/items/weapons.json");

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
                name: "sell",
                description: "Sell an item",
                type: ApplicationCommandOptionType.Subcommand
            }
        ]
    },
    execute(app, interaction, data, embed){
        const subcommand = interaction.options.getSubcommand();
        switch(subcommand){
            case "weapon":
                openShop(app, interaction, data, embed, weapons, "Weapons");
            break;
        }
    }
}
async function openShop(app, interaction, data, embed, itemType, type){
    const {player} = data;
    if(player == null) return await interaction.reply("You don't have data to use this command!");
    embed.setTitle(`${type} Shop`);
    let itemToBuy = [];
    for(const item in itemType){
        if(itemType[item].value.buy){
            if(itemType[item].value.buy.copper && !itemType[item].value.buy.silver){
                itemToBuy.push(`**${item.split("_").join(" ")}**.....**${itemType[item].value.buy.copper}** copper coins`);
            }else if(itemType[item].value.buy.copper && itemType[item].value.buy.silver){
                itemToBuy.push(`**${item.split("_").join(" ")}**.....**${itemType[item].value.buy.silver}** silver and **${weapons[item].value.buy.copper}** copper coins`);
            }
        }else{
            continue;
        }
    }
    embed.addFields({name: `${type}`, value: itemToBuy.join("\n")});
    const selectMenuRow = new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
            .setCustomId("select")
            .setPlaceholder("Nothing selected")
            .addOptions(
                {
                   label: "Bow",
                   description: "Buy a Bow",
                   value: "bow", 
                },
                {
                    label: "Arrow",
                    description: "Buy an Arrow",
                    value: "arrow", 
                 },
                 {
                    label: "Steyr Arms Scout Rifle",
                    description: "Buy a hunting rifle",
                    value: "steyr_arms_scout_rifle", 
                 },
                 {
                    label: "308 Winchester Bullet",
                    description: "Buy bullets for the hunting rilfe",
                    value: "308_winchester_bullet", 
                 },
                 {
                    label: "Pickaxe",
                    description: "Buy a Pickaxe",
                    value: "pickaxe", 
                 },
                 {
                    label: "Wood Cutters Axe",
                    description: "Buy a cutting Axe",
                    value: "wood_cutters_axe", 
                 },
                 {
                    label: "Fishing Rod",
                    description: "Buy a Fishing Rod",
                    value: "fishing_rod", 
                 }
            )
    );
    const buttonMenuRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
                .setCustomId("buy")
                .setLabel("Buy")
                .setStyle(ButtonStyle.Primary)
    );
    let reply = await interaction.reply({embeds: [embed], components: [selectMenuRow, buttonMenuRow], fetchReply: true, ephemeral: true});
    const filter = x => x.user.id === interaction.member.id;
    const collector = reply.createMessageComponentCollector({filter, time: 60000});
    let buyItem;
    collector.on("collect", async (x) => {
        let updatedPlayer = await app.db.users.findOne({id: interaction.member.id}).exec();
        switch(x.componentType){
            case 3: // Select Menu
                buyItem = x.values.shift();
            break;
            case 2: // Button
                if(buyItem){
                    for( const item in weapons){
                        if(buyItem == item.toLowerCase()){
                            let copper = weapons[item].value.buy.copper;
                            let silver = weapons[item].value.buy.silver ? weapons[item].value.buy.silver : 0;
                            if((updatedPlayer.wallet.get("copper") < copper && updatedPlayer.wallet.get("silver") < silver && updatedPlayer.wallet.get("gold") == 0) || (updatedPlayer.wallet.get("copper") == 0 && updatedPlayer.wallet.get("silver") == 0 && updatedPlayer.wallet.get("gold") == 0)){
                                await interaction.followUp({content: `You don't have enough coins to pay for ${item.split("_").join(" ")}!`, ephemeral: true});
                            }else{
                                let curCop = updatedPlayer.wallet.get("copper");
                                let curSil = updatedPlayer.wallet.get("silver");
                                let newCopVal = -copper;
                                let newSilVal = -silver;
                                let gold = 0;
                                if((curCop < copper || curSil <= silver) && updatedPlayer.wallet.get("gold") > 0){
                                    if(curSil <= silver && updatedPlayer.wallet.get("gold") > 0){
                                        while(curSil <= silver && updatedPlayer.wallet.get("gold") > 0){
                                            curSil = curSil + 100;
                                            gold -= 1;
                                        }
                                    }
                                    newSilVal = curSil - silver;
                                    if(curCop < copper){
                                        while(curCop < copper){
                                            curCop = curCop + 100;
                                            newSilVal -= 1;
                                        }
                                    }
                                    newCopVal = curCop - copper;
                                    await updatedPlayer.updateOne({
                                        $set: {
                                            [`wallet.silver`]: newSilVal,
                                            [`wallet.copper`]: newCopVal
                                        },
                                        $inc: {
                                            [`wallet.gold`]: gold
                                        }
                                    });
                                }else{
                                    await updatedPlayer.updateWallet(gold, newSilVal, newCopVal);
                                }
                                updatedPlayer.updateInventory(weapons[item].name, 1);
                                await interaction.followUp({content: `You bought a(n) ${item.split("_").join(" ")}!`, ephemeral: true});
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
            .setPlaceholder(`${buyItem}`)
            .addOptions(
                {
                   label: "Bow",
                   description: "Buy a Bow",
                   value: "bow", 
                },
                {
                    label: "Arrow",
                    description: "Buy an Arrow",
                    value: "arrow", 
                 },
                 {
                    label: "Steyr Arms Scout Rifle",
                    description: "Buy a hunting rifle",
                    value: "steyr_arms_scout_rifle", 
                 },
                 {
                    label: "308 Winchester Bullet",
                    description: "Buy bullets for the hunting rilfe",
                    value: "308_winchester_bullet", 
                 },
                 {
                    label: "Pickaxe",
                    description: "Buy a Pickaxe",
                    value: "pickaxe", 
                 },
                 {
                    label: "Wood Cutters Axe",
                    description: "Buy a cutting Axe",
                    value: "wood_cutters_axe", 
                 },
                 {
                    label: "Fishing Rod",
                    description: "Buy a Fishing Rod",
                    value: "fishing_rod", 
                 }
            )
        )
        selectMenuRow.components.shift();
        await x.update({components: [selectMenuRow, buttonMenuRow]});
    });
    collector.on("end", async() => {
        buttonMenuRow.components.map(x => x.setDisabled(true));
        selectMenuRow.components.map(x => x.setDisabled(true));
        await interaction.followUp("You ran out of time!");
    });
}
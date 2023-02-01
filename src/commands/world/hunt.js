const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, 
    ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const weaponList = require("../../static/items/weapons.json");
const animalList = require("../../static/jsons/animals.json");
let ammo;

module.exports = {
    info: {
        name: "hunt",
        description: "hunt animals!",
        type: ApplicationCommandType.ChatInput,
        options: [
            {
                name: "weapon_type",
                type: ApplicationCommandOptionType.String,
                description: "weapon to use",
                choices: [
                    {
                        name: "Gun",
                        value: "gun"
                    },
                    {
                        name: "Light Bow",
                        value: "light_bow"
                    },
                    {
                        name: "Bow",
                        value: "bow"
                    },
                    {
                        name: "Great Bow",
                        value: "great_bow"
                    }
                ],
                required: true
            },
            {
                name: "weapon_name",
                type: ApplicationCommandOptionType.String,
                description: "name of the weapon you want to use",
                required: true
            }
        ]
    },
    async execute(app, interaction, data, embed){
        let {player} = data;
        let weaponType = interaction.options.getString("weapon_type");
        let weapon = interaction.options.getString("weapon_name");
        let fixedString = app.utility.upperCaseEachWord(weapon);
        if(player == null) return await interaction.reply("You don't have data to use this command!");
        if(player.stamina < 15) return await interaction.reply("You don't have enough stamina, try resting for a bit!");
        if(player.cooldowns.get("hunt") > interaction.createdTimestamp){
            await interaction.reply({content: `You can run **hunt** <t:${Math.round(player.cooldowns.get("hunt")/1000)}:R>`, ephemeral: true});
            return;
        }
        if(player.professions.get("survival") == null) return await interaction.reply("You need the survival profession to use this command!");
        if(!player.inventory.get(fixedString)) return await interaction.reply(`You do not have a ${fixedString.split("_").join(" ")}!`);
        let ammoList; let type;
        for(const item in weaponList){
            if(weaponList[item].name == fixedString){
                ammoList = weaponList[item].ammo;
                type = weaponList[item].type;
            }
        }
        if(type != weaponType) return await interaction.reply("That isn't a valid item!");
        for(let i = 0; i < ammoList.length; i++) {
            if(player.inventory.get(ammoList[i])) {
                ammo = ammoList[i];
                break; 
            }
            if(i == ( ammoList.length - 1 )) return await interaction.reply("You don't have the proper ammo!");
        }
        let skinning = false;
        if(player.professions.get("skinning") != null) {
            skinning = true;
        }
        await interaction.reply("You begin hunting for animals...");
        let num = app.utility.randomInt(2000, 10000);
        setTimeout(async function(){
            const buttonMenu = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("shoot")
                    .setLabel("Shoot!")
                    .setStyle(ButtonStyle.Primary)
            );
            let skinningButtonMenu;
            if(skinning == true){
                skinningButtonMenu = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("skin")
                        .setLabel("Skin")
                        .setStyle(ButtonStyle.Primary)
                );
            }
            reply = await interaction.editReply({content: "You begin hunting for animals...", components: [buttonMenu]});
            const filter = x => x.user.id === interaction.member.id;
            const collector = reply.createMessageComponentCollector({filter, idle: 4500});
            let noStam = false;
            collector.on("collect", async (x) => {
                switch(x.customId){
                    case "shoot":
                        checkProfessionTier(app, player, interaction, "survival", embed);
                        if(skinning == true){
                            await x.update({components: [skinningButtonMenu]});
                        }else{
                            buttonMenu.components[0].setDisabled(true);
                            await x.update({components: [buttonMenu]});
                        }
                    break;
                    case "skin":
                        if(player.stamina < 15){
                            noStam = true;
                            await interaction.followUp("You don't have enough stamina, try resting for a bit!");
                            skinningButtonMenu.components[0].setDisabled(true);
                            await x.update({components: [skinningButtonMenu]});
                            return;
                        }
                        checkProfessionTier(app, player, interaction, "skinning", embed);
                        skinningButtonMenu.components[0].setDisabled(true);
                        await x.update({components: [skinningButtonMenu]});
                    break;
                }
            });
            collector.on("end", async(collected) => {
                if(noStam == true){
                    return;
                }
                if(collected.size == 0){
                    if(skinning == true) return await interaction.followUp("You idled too long the skin is now bad!");
                    return await interaction.followUp("The animal ran away, better luck next time!");
                }
                if(skinning == true) return await interaction.followUp("Nice skin you got there!");
                return await interaction.followUp("Congrats on the kill!");
            });
        }, num);
    }
}
async function checkProfessionTier(app, player, interaction, professionStrName, embed) {
    let itemArr = []; let animalArr = []; let maxLvl; let skinArrLength;
    const profession = player.professions.get(professionStrName);
    switch(true){
        case profession <= 50:
            animalList.landAnimals.forEach(x => {
                if(x.tier == 1){
                    animalArr.push(x.name);
                    if(professionStrName == "survival"){
                        itemArr.push(x.drops[0]);
                    }else{
                        skinArrLength = x.skin.tier1.length;
                        itemArr.push(x.skin.tier1);
                    }
                }
            });
            maxLvl = 50;
        break;
        case profession >= 51 && profession <= 100:
            animalList.landAnimals.forEach(x => {
                if(x.tier == 1 || x.tier == 2){
                    animalArr.push(x.name);
                    if(professionStrName == "survival"){
                        itemArr.push(x.drops[0]);
                    }else{
                        skinArrLength = x.skin.tier2.length;
                        itemArr.push(x.skin.tier2);
                    }
                }
            });
            maxLvl = 100;
        break;
        case profession >= 101 && profession <= 150:
            animalList.landAnimals.forEach(x => {
                if(x.tier == 1 || x.tier == 2 || x.tier == 3){
                    animalArr.push(x.name);
                    if(professionStrName == "survival"){
                        itemArr.push(x.drops[0]);
                    }else{
                        skinArrLength = x.skin.tier3.length;
                        itemArr.push(x.skin.tier3);
                    }
                }
            });
            maxLvl = 150;
        break;
    }
    let animal = animalArr[ app.utility.randomInt( 0, animalArr.length ) ];
    let item;
    const proExp = 5;
    const stam = 15;
    await player.updateStamina(-stam);
    if(professionStrName == "survival"){
        item = itemArr[ animalArr.indexOf(animal) ];
        embed.setTitle(`${animal.split("_").join(" ")}`).addFields(
            {name: `Stamina:`, value: `\`${player.stamina}/${player.maxStamina}\`\nYou lost ${stam} stamina`},
            {name: `You killed a ${animal.split("_").join(" ")}!`, value: `${item.split("_").join(" ")} has been added to your inventory!`}
        );
        await player.updateInventory(ammo, -1);
        await player.updateOne({$set: {"cooldowns.hunt": interaction.createdTimestamp + 30000}});
        await interaction.editReply({embeds: [embed]});
    }else{
        await player.updateOne({$set: {"cooldowns.skin": interaction.createdTimestamp + 30000}});
        item = itemArr[ animalArr.indexOf(animal) ][ app.utility.randomInt(0, skinArrLength) ];
        const skinEmbed = new EmbedBuilder()
            .setTitle(`${animal.split("_").join(" ")}`).addFields(
                {name: `Stamina:`, value: `\`${player.stamina}/${player.maxStamina}\`\nYou lost ${stam} stamina`},
                {name: `You skinned a ${animal.split("_").join(" ")}!`, value: `${item.split("_").join(" ")} has been added to your inventory!`}
            );
        await interaction.followUp({embeds: [skinEmbed]});
    }
    await player.updateInventory(item, 1);
    if(player.professions.get(professionStrName) < maxLvl){
        let stringFix = app.utility.upperCaseEachWord(professionStrName);
        player.updateProfession(professionStrName, proExp);
        await interaction.followUp(`${stringFix.split("_").join(" ")} has increased by **${proExp}**. ${stringFix.split("_").join(" ")} is now **${player.professions.get(professionStrName)}**`);
    }
    await player.save();
}
const { ApplicationCommandType } = require("discord.js");

module.exports = {
    info: {
        name: "mine",
        description: "mine ore!",
        type: ApplicationCommandType.ChatInput
    },
    async execute(app, interaction, data, embed){
        let {player} = data;
        if(player == null) return await interaction.reply("You don't have data to use this command!");
        if(player.resting == true) return await interaction.reply("You are currently resting, you can't use other commands!");
        if(player.professions.get("mining") == null) return await interaction.reply("You need the mining profession to use this command!");
        if(!player.inventory.get("Pickaxe")) return await interaction.reply("You don't have a pickaxe to mine with!");
        if(player.stamina < 15) return await interaction.reply("You don't have enough stamina, try resting for a bit!");
        if(player.cooldowns.get("mine") > interaction.createdTimestamp){
            await interaction.reply({content: `You can run **mine** <t:${Math.round(player.cooldowns.get("mine")/1000)}:R>`, ephemeral: true});
            return;
        }
        let reply = "You raise your pickaxe..."
        await interaction.reply(reply);
        let num = 0;
        let interval = setInterval(async function(){
            reply = reply + "Tink...";
            await interaction.editReply(reply);
            num += 1;
            if(num == 3){
                clearInterval(interval);
            }
        }, 2000);
        setTimeout(async function(){
            let itemArr; let bonus;
            const proExp = 5;
            const numOfOre = app.utility.randomInt( 2, 5);
            const profession = player.professions.get('mining');
            let maxLvl;
            let num = app.utility.randomInt(1, 100);
            switch(true){
                case num <= 100 && num >= 91:
                    bonus = ["Topaz"];
                break;
                case num <= 90 && num >= 76:
                    bonus = ["Empty_Rune"];
                break;
                case num <= 75 && num >= 60:
                    bonus = ["Fire_Essence"];
                break;
                default: bonus = [];
            }
            switch(true){
                case profession <= 50:
                    itemArr = ["Coal", "Copper_Ore", "Tin_Ore"];
                    maxLvl = 50;
                break;
                case profession >= 51 && profession <= 100:
                    itemArr = ["Coal", "Copper_Ore", "Tin_Ore", "Iron_Ore", "Lead_Ore"];
                    maxLvl = 100;
                break;
                case profession >= 101 && profession <= 150:
                    itemArr = ["Coal", "Copper_Ore", "Tin_Ore", "Iron_Ore", "Lead_Ore", "Silver_Ore", "Tungsten_Ore"];
                    maxLvl = 150;
                break;
            };
            const ore = itemArr[ app.utility.randomInt( 0, itemArr.length ) ];
            const stam = 15;
            let bonusItem;
            await player.updateStamina(-stam);
            await player.updateInventory(ore, numOfOre);
            await player.updateOne({$set: {"cooldowns.mine": interaction.createdTimestamp + 15000}});
            embed.setTitle(`${ore.split("_").join(" ")}`).addFields(
                {name: `Stamina:`, value: `\`${player.stamina}/${player.maxStamina}\`\nYou lost ${stam} stamina`},
                {name: `You mined ${ore.split("_").join(" ")}!`, value: `${numOfOre} ${ore.split("_").join(" ")} has been added to your inventory!`}
            );
            await interaction.editReply({embeds: [embed]});
            if(bonus.length >= 1){
                bonusItem = bonus[ app.utility.randomInt( 0, bonus.length ) ];
                await player.updateInventory(bonusItem, 1);
                await interaction.followUp(`You also recieved **1 ${bonusItem.split("_").join(" ")}**`);
            }
            if(profession < maxLvl){ // change max based on tier
                player.updateProfession("mining", proExp);
                await interaction.followUp(`Mining has increased by **${proExp}**. Mining is now **${player.professions.get('mining')}**`);
            }
            await player.save();
        }, 6100);
    }
}
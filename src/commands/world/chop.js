const { ApplicationCommandType } = require("discord.js");

module.exports = {
    info: {
        name: "chop",
        description: "collect wood!",
        type: ApplicationCommandType.ChatInput
    },
    async execute(app, interaction, data, embed){
        let {player} = data;
        if(player == null) return await interaction.reply("You don't have data to use this command!");
        if(player.professions.get("logging") == null) return await interaction.reply("You need the logging profession to use this command!");
        if(!player.inventory.get("Wood_Cutters_Axe")) return await interaction.reply("You don't have a wood cutting axe to chop wood!");
        if(player.stamina < 15) return await interaction.reply("You don't have enough stamina, try resting for a bit!");
        if(player.cooldowns.get("chop") > interaction.createdTimestamp){
            await interaction.reply({content: `You can run **chop** <t:${Math.round(player.cooldowns.get("chop")/1000)}:R>`, ephemeral: true});
            return;
        }
        let reply = "You raise your axe..."
        await interaction.reply(reply);
        let num = 0;
        let interval = setInterval(async function(){
            reply = reply + "Chop...";
            await interaction.editReply(reply);
            num += 1;
            if(num == 3){
                clearInterval(interval);
            }
        }, 1750);
        setTimeout(async function(){
            let itemArr;
            const proExp = 5;
            const numOfLogs = app.utility.randomInt(1, 3);
            const profession = player.professions.get('logging');
            let maxLvl;
            switch(true){
                case profession <= 50:
                    itemArr = ["Oak_Wood"];
                    maxLvl = 50;
                break;
                case profession >= 51 && profession <= 100:
                    itemArr = ["Oak_Wood", "Maple_Wood"];
                    maxLvl = 100;
                break;
                case profession >= 101 && profession <= 150:
                    itemArr = ["Oak_Wood", "Maple_Wood", "Alder_Wood"];
                    maxLvl = 150;
                break;
            };
            const item = itemArr[ app.utility.randomInt( 0, itemArr.length ) ];
            const stam = 15
            await player.updateInventory(item, numOfLogs);
            await player.updateOne({$set: {"cooldowns.chop": interaction.createdTimestamp + 15000}});
            await player.updateStamina(-stam);
            embed.setTitle(`${item.split("_").join(" ")}`).addFields(
                {name: `Stamina:`, value: `\`${player.stamina}/${player.maxStamina}\`\nYou lost ${stam} stamina`},
                {name: `You chopped ${item.split("_").join(" ")}!`, value: `${numOfLogs} ${item.split("_").join(" ")} has been added to your inventory!`}
            );
            await interaction.editReply({embeds: [embed]});
            if(player.professions.get("logging") < maxLvl){ // change max based on tier
                player.updateProfession("logging", proExp);
                await interaction.followUp(`Logging has increased by **${proExp}**. Logging is now **${player.professions.get("logging")}**`);
            }
            await player.save();
        }, 6000);
    }
}
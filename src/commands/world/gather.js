const { ApplicationCommandType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
    info: {
        name: "gather",
        description: "gather plants!",
        type: ApplicationCommandType.ChatInput
    },
    async execute(app, interaction, data, embed){
        let {player} = data;
        if(player == null) return await interaction.reply("You don't have data to use this command!");
        if(player.stamina < 15) return await interaction.reply("You don't have enough stamina, try resting for a bit!");
        if(player.professions.get("herbalism") == null) return await interaction.reply("You need the herbalism profession to use this command!");
        if(player.cooldowns.get("gather") > interaction.createdTimestamp){
            await interaction.reply({content: `You can run **gather** <t:${Math.round(player.cooldowns.get("gather")/1000)}:R>`, ephemeral: true});
            return;
        }
        await interaction.reply("You look around the area...");
        let num = app.utility.randomInt(2000, 10000);
        setTimeout(async function(){
            const buttonMenu = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("gather")
                    .setLabel("Grab Item")
                    .setStyle(ButtonStyle.Primary)
            );
            reply = await interaction.editReply({content: "You look around the area...", components: [buttonMenu]});
            const filter = x => x.user.id === interaction.member.id;
            const collector = reply.createMessageComponentCollector({filter, idle: 4000});
            collector.on("collect", async (x) => {
                let itemArr;
                const proExp = 5;
                const numOfPlant = app.utility.randomInt(1, 3);
                const profession = player.professions.get('herbalism');
                let maxLvl;
                switch(true){
                    case profession <= 50:
                        itemArr = ["Herb", "Mushroom", "Fiber", "Moss", "Red_Mountain_Flower", "Blue_Mountain_Flower"];
                        maxLvl = 50;
                    break;
                    case profession >= 51 && profession <= 100:
                        itemArr = ["Herb", "Mushroom", "Fiber", "Moss", "Red_Mountain_Flower", 
                        "Blue_Mountain_Flower", "Purple_Mountain_Flower", "Nightshade"];
                        maxLvl = 100;
                    break;
                    case profession >= 101 && profession <= 150:
                        itemArr = ["Herb", "Mushroom", "Fiber", "Moss", "Red_Mountain_Flower", 
                        "Blue_Mountain_Flower", "Purple_Mountain_Flower", "Nightshade", "Fire_Lily",
                        "Golden_Rose"];
                        maxLvl = 150;
                    break;
                }
                let plant = itemArr[ app.utility.randomInt(0, itemArr.length) ];
                const stam = 15;
                await player.updateStamina(-stam);
                await player.updateInventory(plant, numOfPlant);
                await player.updateOne({$set: {"cooldowns.gather": interaction.createdTimestamp + 15000}});
                embed.setTitle(`${plant.split("_").join(" ")}`).addFields(
                    {name: `Stamina:`, value: `\`${player.stamina}/${player.maxStamina}\`\nYou lost ${stam} stamina`},
                    {name: `You found a ${plant.split("_").join(" ")}!`, value: `${numOfPlant} ${plant.split("_").join(" ")} has been added to your inventory!`}
                );
                await interaction.editReply({embeds: [embed]});
                if(player.professions.get("herbalism") < maxLvl){ // change max based on tier
                    player.updateProfession("herbalism", proExp);
                    await interaction.followUp(`Herbalism has increased by **${proExp}**. Herbalism is now **${player.professions.get("herbalism")}**`);
                }
                await player.save();
                buttonMenu.components[0].setDisabled(true);
                await x.update({components: [buttonMenu]});
            });
            collector.on("end", async(collected) => {
                if(collected.size == 0){
                    return await interaction.followUp("You were idle for too long!");
                }
                return await interaction.followUp("Such an awesome find!");
            });
        }, num);
    }
}
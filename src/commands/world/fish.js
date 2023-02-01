const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const animalList = require("../../static/jsons/animals.json");

module.exports = {
    info: {
        name: "fish",
        description: "catch fish!",
        type: ApplicationCommandType.ChatInput,
        options: [{
            name: "bait",
            type: ApplicationCommandOptionType.String,
            description: "Bait to use",
            required: true
        }]
    },
    async execute(app, interaction, data, embed){
        let {player} = data;
        let bait = interaction.options.getString("bait");
        let fixedString =  app.utility.upperCaseEachWord(bait);
        if(player == null) return await interaction.reply("You don't have data to use this command!");
        if(player.professions.get("fishing") == null) return await interaction.reply("You need the fishing profession to use this command!");
        if(!player.inventory.get("Fishing_Rod")) return await interaction.reply("You don't have a fishing rod to fish with!");
        if(!player.inventory.get(fixedString)) return await interaction.reply("You don't have any bait to fish with!");
        if(player.stamina < 15) return await interaction.reply("You don't have enough stamina, try resting for a bit!");
        if(player.cooldowns.get("fish") > interaction.createdTimestamp){
            await interaction.reply({content: `You can run **fish** <t:${Math.round(player.cooldowns.get("fish")/1000)}:R>`, ephemeral: true});
            return;
        }
        await interaction.reply("You throw your line out into the water...");
        let num = app.utility.randomInt(2000, 10000);
        setTimeout(async function(){
            const buttonMenu = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("catch")
                    .setLabel("Catch!")
                    .setStyle(ButtonStyle.Primary)
            );
            reply = await interaction.editReply({content: "You throw your line out into the water...", components: [buttonMenu]});
            const filter = x => x.user.id === interaction.member.id;
            const collector = reply.createMessageComponentCollector({filter, idle: 3000});
            collector.on("collect", async (x) => {
                let itemArr = []; let fishArr = []; let maxLvl;
                const profession = player.professions.get('fishing');
                switch(true){
                    case profession <= 50:
                        animalList.waterAnimals.forEach(x => {
                            if(x.tier == 1){
                                fishArr.push(x.name);
                                itemArr.push(x.drops[0]);
                            }
                        });
                        maxLvl = 50;
                    break;
                    case profession >= 51 && profession <= 100:
                        animalList.waterAnimals.forEach(x => {
                            if(x.tier == 1 || x.tier == 2){
                                fishArr.push(x.name);
                                itemArr.push(x.drops[0]);
                            }
                        });
                        maxLvl = 100;
                    break;
                    case profession >= 101 && profession <= 150:
                        animalList.waterAnimals.forEach(x => {
                            if(x.tier == 1 || x.tier == 2 || x.tier == 3){
                                fishArr.push(x.name);
                                itemArr.push(x.drops[0]);
                            }
                        });
                        maxLvl = 150;
                    break;
                }
                let fish = fishArr[ app.utility.randomInt( 0, fishArr.length ) ];
                let item = itemArr[ fishArr.indexOf(fish) ];
                const proExp = 5;
                const stam = 15;
                await player.updateInventory(item, 1);
                await player.updateInventory(fixedString, -1);
                await player.updateOne({$set: {"cooldowns.fish": interaction.createdTimestamp + 30000}});
                await player.updateStamina(-stam);
                embed.setTitle(`${fish.split("_").join(" ")}`).addFields(
                    {name: `Stamina:`, value: `\`${player.stamina}/${player.maxStamina}\`\nYou lost ${stam} stamina`},
                    {name: `You caught ${fish.split("_").join(" ")}!`, value: `${item.split("_").join(" ")} has been added to your inventory!`}
                );
                await interaction.editReply({embeds: [embed]});
                if(player.professions.get("fishing") < maxLvl){
                    player.updateProfession("fishing", proExp);
                    await interaction.followUp(`Fishing has increased by **${proExp}**. Fishing is now **${player.professions.get("fishing")}**`);
                }
                await player.save();
                buttonMenu.components[0].setDisabled(true);
                await x.update({components: [buttonMenu]});
            });
            collector.on("end", async(collected) => {
                if(collected.size == 0){
                    return await interaction.followUp("You didn't catch the fish fast enough! Better luck next time!");
                }
                return await interaction.followUp("Congrats on the caught!");
            });
        }, num);
    }
}
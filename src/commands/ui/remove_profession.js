const { ApplicationCommandType, EmbedBuilder, ButtonBuilder, 
    ActionRowBuilder, SelectMenuBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    info: {
        name: "remove_profession",
        description: "Remove a Profession you own.",
        type: ApplicationCommandType.ChatInput
    },
    async execute(app, interaction, data, embed){
        let { player } = data;
        if(player == null) return await interaction.reply("You don't have data to use this command!");
        if(player.professions.size > 0){
            let labels = []; let descriptions = []; let values = [];
            for( const [key] of player.professions){
                labels.push(key);
                descriptions.push(`removes the ${key} profession.`);
                values.push(key);
            }
            embed = createEmbed(player, embed);
            let selectMenuRow = new ActionRowBuilder().addComponents(
                new SelectMenuBuilder()
                    .setCustomId("select")
                    .setPlaceholder("Nothing Selected")
            );
            selectMenuRow = addOptions(labels, descriptions, values, selectMenuRow);
            let buttonMenuRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("remove")
                    .setLabel("Remove")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true)
            );
            let reply = await interaction.reply({embeds: [embed], components: [selectMenuRow, buttonMenuRow]});
            const filter = x => x.user.id === interaction.member.id;
            const collector = reply.createMessageComponentCollector({filter, idle: 300000});
            let curItem = false;
            collector.on("collect", async (x) => {
                let updatedPlayer = await app.db.users.findOne({id: interaction.member.id}).exec();
                switch(true){
                    case x.customId == "select":
                        curItem = x.values.shift();
                        app.utility.enableButtons(buttonMenuRow);
                    break;
                    case x.customId == "remove":
                        if(curItem == false) await interaction.followUp("You need to select a profession first!");
                        await updatedPlayer.removeProfession(curItem);
                        switch(curItem){
                            case "mining":
                                updatedPlayer.cooldowns.delete("mine");
                            break;
                            case "herbalism":
                                updatedPlayer.cooldowns.delete("gather");
                            break;
                            case "logging":
                                updatedPlayer.cooldowns.delete("chop");
                            break;
                            case "skinning":
                                updatedPlayer.cooldowns.delete("skin");
                            break;
                            case "survival":
                                updatedPlayer.cooldowns.delete("hunt");
                            break;
                            case "fishing":
                                updatedPlayer.cooldowns.delete("fish");
                            break;
                        }
                        await interaction.followUp(`You removed ${curItem} profession.`);
                        await updatedPlayer.save();
                        const newEmbed = new EmbedBuilder().setColor("#D63FB5");
                        embed = createEmbed(updatedPlayer, newEmbed);
                        curItem = false;
                    break;
                }
                if(updatedPlayer.professions.size > 0){
                    labels = []; descriptions = []; values = [];
                    for( const [key] of updatedPlayer.professions){
                        labels.push(key);
                        descriptions.push(`removes the ${key} profession.`);
                        values.push(key);
                    }
                    let newSelectMenuRow = new ActionRowBuilder().addComponents(
                        new SelectMenuBuilder()
                            .setCustomId("select")
                            .setPlaceholder("Nothing Selected")
                    );
                    newSelectMenuRow = addOptions(labels, descriptions, values, newSelectMenuRow);
                    newSelectMenuRow.components[0].setPlaceholder(curItem != false ? `${curItem}` : "Nothing Selected");
                    await x.update({embeds: [embed], components: [newSelectMenuRow, buttonMenuRow]});
                }else{
                    let noProEmbed = new EmbedBuilder()
                        .setTitle("Yikes")
                        .addFields({name: "You Have No Professions", value: "You can buy professions from trainers using the `trainers` command!"});
                    await x.update({embeds: [noProEmbed], components: []});
                }
            });
            collector.on("end", async() => {
                return await interaction.followUp("There was no recent interactions, closing the menu.");
            });
        }else{
            embed.setTitle("Yikes").addFields({name: "You Have No Professions", value: "You can buy professions from trainers using the `trainers` command!"});
            await interaction.reply({embeds: [embed]});
        }
    }
}
function addOptions(labels, descriptions, values, selectMenuRow) {
    for(let i = 0; i < labels.length; i++) {
        selectMenuRow.components[0].addOptions(
            {
                label: labels[i],
                description: descriptions[i],
                value: values[i]
            }
        );
    }
    return selectMenuRow;
}
function createEmbed(player, embed) {
    const title = `**${player.name}'s Professions**`;
        embed.setTitle(title);
        let skilledPro = [
            "blacksmithing", "leatherworking", "woodworking", "mining", "herbalism", "alchemy",
            "enchanting", "runecrafting", "logging", "skinning", "tailoring", "jewelcrafting",
            "engineering", "inscription"
        ];
        let lifeProfessions = ["survival", "cooking", "firstaid", "fishing"];
        let skilledProString = ""; let lifeProfessionsString = "";
        let num = 0;
        for(let i = 0; i < skilledPro.length; i++){
            if(player.professions.get(skilledPro[i]) != null){
                skilledProString = skilledProString + `${skilledPro[i]}: ${player.professions.get(skilledPro[i])}\n`;
                num += 1;
            }
        }
        if(num < 2){
            if(num == 0){
                skilledProString = skilledProString + "Empty Slot\n";
            }
            skilledProString = skilledProString + "Empty Slot";
        }
        embed.addFields({name: "Skill Professions", value: `${skilledProString}`});
        num = 0;
        for(let i = 0; i < lifeProfessions.length; i++){
            if(player.professions.get(lifeProfessions[i]) != null){
                lifeProfessionsString = lifeProfessionsString + `${lifeProfessions[i]}: ${player.professions.get(lifeProfessions[i])}\n`;
                num += 1;
            }
        }
        if(num < lifeProfessions.length){
            for(let i = 0; i < (4 - num); i++){
                lifeProfessionsString = lifeProfessionsString + "Empty Slot\n";
            }
        }
        embed.addFields({name: "Life Professions", value: `${lifeProfessionsString}`});
        return embed;
}
const { ApplicationCommandType, EmbedBuilder, ButtonBuilder, 
    ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
    info: {
        name: "rest",
        description: "regenerate hp, chi, and stamina over time",
        type: ApplicationCommandType.ChatInput
    },
    async execute(app, interaction, data, embed){
        let {player} = data;
        if(player == null) return await interaction.reply("You don't have data to use this command!");
        if(player.resting == true) return await interaction.reply("You are currently resting, you can't use other commands!");
        if(player.stamina == player.maxStamina && 
            player.health == player.maxHealth && 
            player.chi == player.maxChi) return await interaction.reply("All health, chi, and stamina is max already no need to rest!");
        embed.setTitle("Resting")
            .addFields(
                {name: `Start resting?`, value: `Hit the start button!`},
                {name: `Health`, value: `\`${player.health}/${player.maxHealth}\``},
                {name: `Chi`, value: `\`${player.chi}/${player.maxChi}\``},
                {name: `Stamina`, value: `\`${player.stamina}/${player.maxStamina}\``}
            );
        let buttonMenuRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("start")
                .setLabel("Start")
                .setStyle(ButtonStyle.Primary)
        )
        let cancelButtonMenu = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("cancel")
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Primary)
        )
        let reply = await interaction.reply({embeds: [embed], components: [buttonMenuRow]});
        const filter = x => x.user.id === interaction.member.id;
        const collector = reply.createMessageComponentCollector({filter});
        let interval;
        collector.on("collect", async (x) => {
            let updatedPlayer = await app.db.users.findOne({id: interaction.member.id}).exec();
            if(x.customId == "start"){
                await x.update({components: [cancelButtonMenu]});
                interval = setInterval(async function(){
                    updatedPlayer = await app.db.users.findOne({id: interaction.member.id}).exec();
                    await updatedPlayer.updateRest(true);
                    if(updatedPlayer.stamina < updatedPlayer.maxStamina) await updatedPlayer.updateStamina(10);
                    if(updatedPlayer.health < updatedPlayer.maxHealth) await updatedPlayer.updateHealth(10);
                    if(updatedPlayer.chi < updatedPlayer.maxChi) await updatedPlayer.updateChi(10);
                    let restEmbed = new EmbedBuilder()
                        .setTitle("Resting")
                        .addFields(
                            {name: `Health`, value: `\`${updatedPlayer.health}/${updatedPlayer.maxHealth}\``},
                            {name: `Chi`, value: `\`${updatedPlayer.chi}/${updatedPlayer.maxChi}\``},
                            {name: `Stamina`, value: `\`${updatedPlayer.stamina}/${updatedPlayer.maxStamina}\``}
                        );
                    await interaction.editReply({embeds: [restEmbed]});
                    await updatedPlayer.save();
                    if(updatedPlayer.stamina == updatedPlayer.maxStamina && updatedPlayer.health == updatedPlayer.maxHealth && updatedPlayer.chi == updatedPlayer.maxChi) {
                        clearInterval(interval);
                        await updatedPlayer.updateRest(false);
                        await updatedPlayer.save();
                        cancelButtonMenu.components[0].setDisabled(true);
                        await collector.stop();
                    }
                }, 5000);
            }
            if(x.customId == "cancel"){
                clearInterval(interval);
                await updatedPlayer.updateRest(false);
                await updatedPlayer.save();
                cancelButtonMenu.components[0].setDisabled(true);
                await x.update({components: [cancelButtonMenu]});
                await collector.stop();
            }
        });
        collector.on("end", async() => {
            await interaction.followUp("You finished resting!");
        });
    }
}
const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, 
    SelectMenuBuilder, ActionRowBuilder } = require("discord.js");

module.exports = {
    info: {
        name: "cooldowns",
        description: "Shows player cooldowns",
        type: ApplicationCommandType.ChatInput,
        options: [{
            name: "player",
            description: "The player's cooldowns you want to check",
            type: ApplicationCommandOptionType.User
        }]
    },
    async execute(app, interaction, data, embed) {
        let {player} = data;
        if(player == null) return await interaction.reply("You don't have data to use this command!");
        let guildMember = interaction.member;
        if(interaction.options.get("player")){
            guildMember = interaction.options.getMember("player");
            player = await app.db.users.findOne({id: guildMember.id}).exec();
            if(!player){
                await interaction.reply({content: "This user doesn't have data.", ephemeral: true});
                return;
            }
        }
        embed.setTitle(`${guildMember.user.tag}'s Cooldowns`)
        .addFields({name: "Select a Catagory", value: "Catagories: World, Daily"});
        const selectMenuRow = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId("select")
                .setPlaceholder("Nothing selected")
                .addOptions(
                    {
                        label: "World",
                        description: "Shows world cooldowns",
                        value: "0"
                    },
                    {
                        label: "Daily",
                        description: "Shows daily cooldowns",
                        value: "1"
                    }
            )
        );
        let cooldownEmbeds = [];
        let embeds;
        if(!cooldownEmbeds.find(x => x.data.title == `${guildMember.user.tag}'s World Cooldowns`) ? true : false){
            cooldownEmbeds = createEmbed(embeds, cooldownEmbeds, guildMember, "World");
        }
        if(!cooldownEmbeds.find(x => x.data.title == `${guildMember.user.tag}'s Daily Cooldowns`) ? true : false){
            cooldownEmbeds = createEmbed(embeds, cooldownEmbeds, guildMember, "Daily");
        }
        for(const [key, value] of player.cooldowns){
            switch(key){
                case "beg":
                    cooldownEmbeds[0].addFields({name: `__**${key}**__`, value: value <= interaction.createdTimestamp ? "Ready" : `<t:${Math.round(value/1000)}:R>`, inline: true});
                break;
                case "search":
                    cooldownEmbeds[0].addFields({name: `__**${key}**__`, value: value <= interaction.createdTimestamp ? "Ready" : `<t:${Math.round(value/1000)}:R>`, inline: true});
                break;
                case "hourly":
                    cooldownEmbeds[1].addFields({name: `__**${key}**__`, value: value <= interaction.createdTimestamp ? "Ready" : `<t:${Math.round(value/1000)}:R>`, inline: true});
                break;
            }
        }
        let reply = await interaction.reply({embeds: [embed], components: [selectMenuRow], fetchReply: true});
        const filter = x => x.user.id === interaction.member.id;
        const collector = reply.createMessageComponentCollector({filter, time: 30000});
        collector.on("collect", async (x) => {
            switch(x.values.shift()) {
                case "0":
                    reply = await interaction.editReply({embeds: [cooldownEmbeds[0]], components: [selectMenuRow], fetchReply: true});
                break;
                case "1":
                    reply = await interaction.editReply({embeds: [cooldownEmbeds[1]], components: [selectMenuRow], fetchReply: true});
                break;
            }
            await x.update({components: [selectMenuRow]});
        });
        collector.on("end", async() => {
            selectMenuRow.components.map(x => x.setDisabled(true));
            await interaction.followUp("You ran out of time!");
        });
    }
}
function createEmbed(embeds, cooldownEmbeds, guildMember, type){
    embeds = new EmbedBuilder().setTitle(`${guildMember.user.tag}'s ${type} Cooldowns`);
    cooldownEmbeds.push(embeds);
    return cooldownEmbeds;
}
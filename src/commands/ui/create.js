const { ApplicationCommandType } = require("discord.js");

module.exports = {
    info: {
        name: "create",
        description: "create user data",
        type: ApplicationCommandType.ChatInput
    },
    async execute(app, interaction, data, embed) {
        // grab data models
        const guildModel = app.db.guild;
        const playerModel = app.db.users;
        // get data
        let {guild, player} = data;
        // Checks if player has data, if they do stop the command and send they already have it
        if(player != null){
            await interaction.reply("You already have data!");
            return;
        }
        try {
            // creates new data for the guild
            if(guild == null){
                guild = new guildModel({id: interaction.guild.id, name: interaction.guild.name});
                guild = await guild.save();
            }
            // creates new data for the player
            if(player == null){
                player = new playerModel({
                    id: interaction.member.id, 
                    name: interaction.user.tag, 
                    wallet: new Map(),
                    bank: new Map(),
                    cooldowns: new Map(), 
                    inventory: new Map(),
                    spellBook: new Map(),
                    pokebox: new Map()
                });
                try {
                    await interaction.member.send({content: "Data was created for you! Enjoy the bot and don't forget to check up on Acelyon YouTube!", ephemeral: true});
                    await interaction.reply({content: "Sent you a dm!", ephemeral: true});
                }
                catch(err){
                    await interaction.reply({content: "Data was created for you! Enjoy the bot and don't forget to check up on Acelyon YouTube!", ephemeral: true});
                }
                // World Cooldowns
                // player.cooldowns.set("beg", interaction.createdTimestamp);
                // player.cooldowns.set("search", interaction.createdTimestamp);
                // Daily cooldowns
                // player.cooldowns.set("hourly", interaction.createdTimestamp);
                // saves the data
                player = await player.save();
            }
        } catch(err){
            console.log(err);
        }
    }
}
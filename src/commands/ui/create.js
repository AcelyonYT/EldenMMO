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
                    coins: new Map(),
                    cooldowns: new Map(), 
                    inventory: new Map(),
                    spellBook: new Map(),
                    pokebox: new Map()
                });
                try {
                    await interaction.member.send("Data was created for you! Enjoy the bot and don't forget to check up on Acelyon YouTube!");
                    await interaction.reply("Sent you a dm!");
                }
                catch(err){
                    await interaction.reply("Data was created for you! Enjoy the bot and don't forget to check up on Acelyon YouTube!");
                    console.log("Cannot dm that user.");
                }
                // saves the data
                player = await player.save();
            }
        } catch(err){
            console.log(err);
        }
    }
}
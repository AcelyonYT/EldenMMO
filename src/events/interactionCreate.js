const { EmbedBuilder } = require("discord.js");

/**
 * Runs the interaction create event
 * @param {*} app our application
 * @param {*} interaction the interaction object for discord to use
 * @returns 
 */
module.exports = async (app, interaction) => {
    // grab data models
    const guildModel = app.db.guild;
    const playerModel = app.db.users;
    // create the embed
    const embed = new EmbedBuilder().setTimestamp(interaction.createdTimestamp).setColor("#c68958");
    // get player data
    let guild = await guildModel.findOneAndUpdate({id: interaction.guild.id}, {returnDocument: "after"}).exec();
    let player = await playerModel.findOneAndUpdate({id: interaction.user.id}, {returnDocument: "after"}).exec();
    // get the command
    const command = app.commands.get(interaction.commandName);
    // if the interactoin isn't in the guild send this
    if(!interaction.inGuild()){
        await interaction.reply("Commands are not available in dms!");
        return;
    }
    // execute the command
    try{
        await command.execute(app, interaction, {guild, player}, embed);
    }
    catch(err){
        // log the error
        console.log(err);
    }
}
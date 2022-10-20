const { EmbedBuilder } = require("discord.js");

/**
 * Runs the interaction create event
 * @param {*} app our application
 * @param {*} interaction the interaction object for discord to use
 * @returns 
 */
module.exports = async (app, interaction) => {
    if(!interaction.isCommand()) return;
    // grab data models
    const guildModel = app.db.guild;
    const playerModel = app.db.users;
    // create the embed
    const embed = new EmbedBuilder().setTimestamp(interaction.createdTimestamp).setColor("#D63FB5");
    // get player data
    let guild = await guildModel.findOneAndUpdate({id: interaction.guild.id}, {returnDocument: "after"}).exec();
    let player = await playerModel.findOneAndUpdate({id: interaction.user.id}, {returnDocument: "after"}).exec();
    // get staff role
    const role = interaction.member.roles.cache.find(r => r.id === "1020932931197354026");
    // get the command
    const command = app.commands.get(interaction.commandName);
    // if the interactoin isn't in the guild send this
    if(!interaction.inGuild()){
        await interaction.reply("Commands are not available in dms!");
        return;
    }
    // execute the command
    try{
        await command.execute(app, interaction, {guild, player}, embed, role);
    }
    catch(err){
        // log the error
        console.log(err);
    }
}
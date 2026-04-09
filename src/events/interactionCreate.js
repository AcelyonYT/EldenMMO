const { EmbedBuilder } = require("discord.js");

/**
 * Runs the interaction create event
 * @param {*} app our application
 * @param {*} interaction the interaction object for discord to use
 * @returns 
 */
module.exports = async function( interaction )
{
    if( !interaction.isCommand() ) return;
    // create the embed
    const embed = new EmbedBuilder().setTimestamp( interaction.createdTimestamp ).setColor( "#D63FB5" );
    // get player data
    let guild = await this.db.guild.findOneAndUpdate( { id: interaction.guild.id }, { returnDocument: "after" } ).exec();
    let player = await this.db.users.findOneAndUpdate( { id: interaction.user.id }, { returnDocument: "after" } ).exec();
    // get staff role
    const role = interaction.member.roles.cache.find( r => r.id === "ROLE ID HERE IF YOU USE THIS" );
    // get the command
    const command = this.commands.get( interaction.commandName );
    // if the interactoin isn't in the guild send this
    if( !interaction.inGuild() ) return await interaction.reply( "Commands are not available in dms!" );
    // execute the command
    try
    {
        await command.execute( interaction, { guild, player }, embed, role );
    }
    catch(err)
    {
        // log the error
        console.log( err );
    }
};
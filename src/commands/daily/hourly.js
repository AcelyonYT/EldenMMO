const Command = require("../../classes/command.js");
const items = require("../../static/jsons/items.json");

module.exports = class hourly extends Command
{
    constructor( app, { category } )
    {
        super( 
            app, 
            { 
                name: "hourly",
                category: category 
            } 
        );
        this.slashCommand.setDescription( "Claim a reward every hour!" );
    }

    async execute( interaction, data, embed )
    {
        const { player } = data;
        if( player == null || player.resting == true) return await interaction.reply( "You can't use this command you either don't have data or are currently resting!" );
        if( player.cooldowns.get( "hourly" ) > interaction.createdTimestamp ) return await interaction.reply( { content: `You can run **hourly** <t:${ Math.round( player.cooldowns.get( "hourly" )/1000 ) }:R>`, ephemeral: true } );
        const item = items.itemList[ this.app.utility.randomInt( 0, items.itemList.length ) ].name;
        player.updateInventory( item, 1 );
        await player.updateOne( { $set: { "cooldowns.hourly": interaction.createdTimestamp + 3600000 } } );
        await interaction.reply( { content: `You recieved a(n) **${ item.split( "_" ).join( " " ) }**!` } );
        await player.save();
    }
}
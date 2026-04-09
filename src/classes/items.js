const { Collection } = require("discord.js");
const fs = require("fs");
module.exports = class Items
{
    constructor()
    {
        this.items = new Collection();
    }
    loadItems()
    {
        const category = fs.readdirSync( `${ __dirname }/../static/items` ).filter( file => file.endsWith( ".json" ) );
        for( const group of category )
        {
            const file = require( `${ __dirname }/../static/items/${ group }` );
            for( const item in file )
            {
                file[ item ].group = group.split( "." )[ 0 ];
                file[ item ].name = item;
                file[ item ].displayName = item.split( "_" ).join( " " );
                file[ item ].lowerCaseName = item.toLowerCase();
                this.items.set( item, file[ item ] );
            }
        }
        console.log( "All item files have been loaded" );
    }
}
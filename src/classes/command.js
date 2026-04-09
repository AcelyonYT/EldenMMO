const { SlashCommandBuilder } = require("discord.js");
const EldenMMO = require("../app.js");

module.exports = class Command {
    constructor( app, { name, category } )
    {
        this.slashCommand = new SlashCommandBuilder();
        this.slashCommand.setName( name );

        this.name = name;
        this.category = category;

        if( !( app ) )
        {
            throw new Error( "Commands must have an app property!" );
        }
        if( !( app instanceof EldenMMO ) )
        {
            throw new TypeError( "The app property must an instance of type Bobot" );
        }
        this.app = app;

        if( !category )
        {
            throw new Error( "Commands must have a category property!" );
        }
        if( typeof category != "string" )
        {
            throw new TypeError( "The category property must be of type string" );
        }
        this.category = category;
    }
}
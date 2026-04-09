const Command = require("../../classes/command.js");

module.exports = class help extends Command
{
    constructor( app, { category } )
    {
        super(
            app, 
            { 
                name: "help",
                category: category 
            }
        );
        this.slashCommand.setDescription( "Information about the bot!" );
    }

    execute( interaction, data, embed )
    {

    }
}
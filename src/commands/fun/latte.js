const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const Command = require("../../classes/command.js");

module.exports = class latte extends Command
{
    constructor( app, { category } )
    {
        super(
            app, 
            {
                name: "latte",
                category: category
            }
        );
        this.slashCommand.setDescription( "Pictures of the cat Latte" );
    }

    async execute( interaction, data, embed )
    {
        let files = fs.readdirSync( "src/static/lattepictures" );
        let picture = files[ this.app.utility.randomInt( 0, files.length ) ];
        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId( "New" )
                .setEmoji( "🔄" )
                .setStyle( ButtonStyle.Primary )
        );
        const reply = await interaction.reply( { files: [ `./src/static/lattepictures/${ picture }` ], components: [ actionRow ] } );
        const filter = x => x.user.id === interaction.member.id;
        const collector = reply.createMessageComponentCollector( { filter, idle: 120000 } );
        collector.on(
            "collect", async ( x ) => 
            {
                picture = files[ this.app.utility.randomInt( 0, files.length ) ];
                await x.update( { files: [ `./src/static/lattepictures/${ picture }` ], components: [ actionRow ] } );
            }
        );
        collector.on(
            "end", async ( x ) => 
            {
                await interaction.followUp( "You were idle for too long!" );
            }
        );
    }
}
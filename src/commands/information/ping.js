const Command = require("../../classes/command.js");

module.exports = class ping extends Command
{
    constructor( app, { category } )
    {
        super(
            app, 
            {
                name: "ping",
                category: category 
            }
        );
        this.slashCommand
            .setDescription( "send pong or embed" )
            .addStringOption(
                option => option
                    .setName( "information" )
                    .setDescription( "sends information or just pong" )
                    .setRequired( true )
                    .setChoices(
                        {
                            name: "Ping",
                            value: "ping"
                        },
                        {
                            name: "Pong",
                            value: "pong"
                        }
                    )
            );
    }

    async execute( interaction, data, embed )
    {
        const option = interaction.options.getString( "information" );
        if( option == "ping" )
        {
            embed.setTitle( "🏓Pong!" );
            embed.addFields(
                { name: "Latency:", value: `${ Date.now() - interaction.createdTimestamp }ms`, inline: true },
                { name: "API Latency:", value: `${ Math.round( interaction.client.ws.ping ) }ms`, inline: true },
            );
            await interaction.reply( { embeds: [ embed ], ephemeral: true } );
        }
        else
        {
            await interaction.reply( { content: "Pong!", ephemeral: true } );
        }
    }
}
const { SlashCommandBuilder } = require("discord.js");
const Command = require("../../classes/command.js");

module.exports = class bank extends Command 
{
    constructor( app, { category } )
    {
        super(
            app, 
            { 
                name: "bank",
                category: category 
            }
        );
        this.slashCommand
            .setDescription( "Do stuff with your money!" )
            .addSubcommand(
                option => option
                    .setName( "balance" )
                    .setDescription( "Check your bank and wallet" )
                    .addUserOption(
                        option => option
                            .setName( "player" )
                            .setDescription( "The player's balance you want to check" )
                    )
            )
            .addSubcommand(
                option => option
                    .setName( "deposit" )
                    .setDescription( "Deposit money into your bank" )
                    .addIntegerOption(
                        option => option
                            .setName( "copper" )
                            .setDescription( "amount of copper coins you want to deposit" )
                            .setMinValue( 1 )
                            .setMaxValue( 99 )
                    )
                    .addIntegerOption(
                        option => option
                            .setName( "silver" )
                            .setDescription( "amount of silver coins you want to deposit" )
                            .setMinValue( 1 )
                            .setMaxValue( 99 )
                    )
                    .addIntegerOption(
                        option => option
                            .setName( "gold" )
                            .setDescription( "amount of gold coins you want to deposit" )
                            .setMinValue( 1 )
                    ) 
            )
            .addSubcommand(
                option => option
                    .setName( "withdraw" )
                    .setDescription( "Withdraw money from your bank" )
                    .addIntegerOption(
                        option => option
                            .setName( "copper" )
                            .setDescription( "amount of copper coins you want to withdraw" )
                            .setMinValue( 1 )
                            .setMaxValue( 99 )
                    )
                    .addIntegerOption(
                        option => option
                            .setName( "silver" )
                            .setDescription( "amount of silver coins you want to withdraw" )
                            .setMinValue( 1 )
                            .setMaxValue( 99 )
                    )
                    .addIntegerOption(
                        option => option
                            .setName( "gold" )
                            .setDescription( "amount of gold coins you want to withdraw" )
                            .setMinValue( 1 )
                    )
            )
        
    }

    async execute( interaction, data, embed )
    {
        const { player } = data;
        if( player == null || player.resting == true) return await interaction.reply( "You can't use this command you either don't have data or are currently resting!" );
        const subcommand = interaction.options.getSubcommand();
        switch( subcommand )
        {
            case "balance":
                this.checkBalance( player, interaction, embed );
            break;
            case "deposit":
            case "withdraw":
                this.exchange( interaction, player, subcommand );
            break;
        }
    }

    async checkBalance( player, interaction, embed )
    {
        let guildMember = interaction.member;
        if( interaction.options.get( "player" ) )
        {
            guildMember = interaction.options.getMember( "player" );
            player = await this.app.db.users.findOne( { id: guildMember.id } ).exec();
            if( !player ) return await interaction.reply( { content: "This user doesn't have data.", ephemeral: true } );
        }
        let coins = 
        {
            copperInWallet: player.wallet.get("copper"),
            copperInBank: player.bank.get("copper"),
            silverInWallet: player.wallet.get("silver"),
            silverInBank: player.bank.get("silver"),
            goldInWallet: player.wallet.get("gold"),
            goldInBank: player.bank.get("gold"),
        }
        embed.setTitle( `${ guildMember.user.tag }'s Balance` ).addFields(
            { name: "Wallet", value: `**Copper:** ${ coins.copperInWallet }\n**Silver:** ${ coins.silverInWallet }\n**Gold:** ${ coins.goldInWallet }`, inline: true },
            { name: "Bank", value: `**Copper:** ${ coins.copperInBank }\n**Silver:** ${ coins.silverInBank }\n**Gold:** ${ coins.goldInBank }`, inline: true }
        );
        await interaction.reply( { embeds: [ embed ] } );
    }

    async exchange( interaction, player, type )
    {
        let coins = 
        {
            copper: interaction.options.getInteger( "copper"  ) ? interaction.options.getInteger( "copper" ) : 0,
            silver: interaction.options.getInteger( "silver" ) ? interaction.options.getInteger( "silver" ) : 0,
            gold: interaction.options.getInteger( "gold" ) ? interaction.options.getInteger( "gold" ) : 0,
        }
        if( !coins.copper && !coins.silver && !coins.gold ) return await interaction.reply( { content: `You need to put the amount of coins you want to ${ type }` } );
        let arrays = 
        {
            coinArr: [ coins.copper, coins.silver, coins.gold ],
            replyStringArr: [],
            coinType: [ "copper", "silver", "gold" ],
        }
        let haveCoins;
        let reply = type == "deposit" ? "You deposited" : "You withdrew";
        for( let i = 0; i < arrays.coinArr.length; i++ )
        {
            if( arrays.coinArr[i] == 0 ) continue;
            let str = arrays.coinType[ i ];
            haveCoins = await this.checkForCoin( player, interaction, str, type, arrays.coinArr, i );
            if( haveCoins ) return;
            arrays.replyStringArr.push( ` **${arrays.coinArr[i]}** ${str} coins` );
        }
        await this.exchangeCoins( player, type, coins );
        let joinStr = arrays.replyStringArr.join( " and" );
        await interaction.reply( { content: `${ reply.concat( `${ joinStr }`) }` } );
    }

    async checkForCoin( player, interaction, type, exchangeType, coins, i )
    {
        let playerCoins = exchangeType == "deposit" ? player.wallet.get( type ) : player.bank.get( type );
        let haveEnoughCoins = playerCoins <= 0 || playerCoins < coins[ i ];
        if( haveEnoughCoins ) await interaction.reply( { content: `You don't have that many ${ type } coins to ${ exchangeType }!`, ephemeral: true } );
        return haveEnoughCoins;
    }

    async exchangeCoins( player, type, coins )
    {
        let modifyCoins =
        {
            copperFromWallet: type == "deposit" ? -coins.copper : coins.copper,
            silverFromWallet: type == "deposit" ? -coins.silver : coins.silver,
            goldFromWallet: type == "deposit" ? -coins.gold : coins.gold,
            copperFromBank: type == "deposit" ? coins.copper : -coins.copper,
            silverFromBank: type == "deposit" ? coins.silver : -coins.silver,
            goldFromBank: type == "deposit" ? coins.gold : -coins.gold,
        }
        await player.updateCurrency( modifyCoins.goldFromWallet, modifyCoins.silverFromWallet, modifyCoins.copperFromWallet, "wallet" );
        await player.updateCurrency( modifyCoins.goldFromBank, modifyCoins.silverFromBank, modifyCoins.copperFromBank, "bank" );
        await player.save();
    }
}
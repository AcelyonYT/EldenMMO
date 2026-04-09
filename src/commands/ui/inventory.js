const Command = require("../../classes/command.js");
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
let embedIndex = 0;
let currentEmbeds = [];

module.exports = class inventory extends Command 
{
    constructor( app, { category } )
    {
        super(
            app,
            {
                name: "inventory",
                category: category
            }
        );
        this.slashCommand
            .setDescription( "Shows the player inventory" )
            .addUserOption(
                option => option
                    .setName( "player" )
                    .setDescription( "The player's inventory you want to check" )
            );
    }

    async execute( interaction, data, embed )
    {
        let { player } = data;
        if( player == null || player.resting == true) return await interaction.reply( "You can't use this command you either don't have data or are currently resting!" );
        let guildMember = interaction.member;
        if( interaction.options.get( "player" ) )
        {
            guildMember = interaction.options.getMember( "player" );
            player = await this.app.db.users.findOne( { id: guildMember.id } ).exec();
            if( !player )
            {
                await interaction.reply( { content: "This user doesn't have data.", ephemeral: true } );
                return;
            }
        }
        const title = `**${guildMember.user.tag}'s Inventory**`;
        embed
            .setTitle( title )
            .addFields(
                { name: "Select a Category in the Select Menu", value: "Categories:\nMaterials\nMisc\nBooks\nWeapons\nBait\nFood\nArmor\nJewelery\nPotions\nRunes\nGlyphs" }
            );
        const noItemEmbed = new EmbedBuilder()
            .setTitle( title )
            .addFields( { name: `**No Items**`, value: `You don't have any items from this category` } );
        let materials = [], misc = [], books = [], weapons = [], 
            bait = [], food = [], armor = [], jewelery = [], 
            potions = [], runes = [], glyphs = [];
        for( const [key, value] of player.inventory )
        {
            if( value <= 0 )
            {
                player.inventory.delete( key );
            }
            else
            {
                const item = this.app.items.items.get( key );
                const name = item.displayName;
                let itemString = `**${name} ─ ${value}**`;
                switch( item.group )
                {
                    case 'materials':   materials.push( itemString ); break;
                    case 'misc':        misc.push( itemString ); break;
                    case 'books':       books.push( itemString ); break;
                    case 'weapons':     weapons.push( itemString ); break;
                    case 'bait':        bait.push( itemString ); break;
                    case 'food':        food.push( itemString ); break;
                    case 'armor':       armor.push( itemString ); break;
                    case 'jewelery':    jewelery.push( itemString ); break;
                    case 'potions':     potions.push( itemString ); break;
                    case 'runes':       runes.push( itemString ); break;
                    case 'glyphs':      glyphs.push( itemString ); break;
                }
            }
        }
        await player.save();
        let labels = [
            "Materials", "Misc", "Books", "Weapons", 
            "Bait", "Food", "Armor", "Jewelery", 
            "Potions", "Runes", "Glyphs",
        ], 
            descriptions = [
                "Shows materials in your inventory", "Shows misc items in your inventory", 
                "Shows books in your inventory", "Shows weapons in your inventory", 
                "Shows bait in your inventory", "Shows food in your inventory",
                "Shows armor in your inventory", "Shows jewelery in your inventory",
                "Shows potions in your inventory", "Shows runes in your inventory",
                "Shows glyphs in your inventory",
            ], 
            values = [
                "materials", "misc", "books", "weapons", 
                "bait", "food", "armor", "jewelery", 
                "potions", "runes", "glyphs",
            ];
        let selectMenuRow = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId( "select" )
                .setPlaceholder( "Nothing selected" )
        );
        selectMenuRow = this.app.utility.addOptions( labels, descriptions, values, selectMenuRow, labels.length, 0 );
        const buttonMenuRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                    .setCustomId( "back" )
                    .setLabel( "<<" )
                    .setStyle( ButtonStyle.Primary )
                    .setDisabled( true ),
            new ButtonBuilder()
                    .setCustomId( "forward" )
                    .setLabel( ">>" )
                    .setStyle( ButtonStyle.Primary )
                    .setDisabled( true )
        );
        let reply = await interaction.reply( { embeds: [ embed ], components: [ selectMenuRow, buttonMenuRow ], fetchReply: true } );
        const filter = x => x.user.id === interaction.member.id;
        const collector = reply.createMessageComponentCollector( { filter, idle: 30000 } );
        let materialEmbeds = [], miscEmbeds = [], 
            booksEmbeds = [], weaponsEmbed = [],
            baitEmbeds = [], foodEmbeds = [], 
            armorEmbeds = [], jeweleryEmbeds = [],
            potionsEmbeds = [], runesEmbeds = [], 
            glyphsEmbeds = [];
        this.app.utility.enableButtons(buttonMenuRow);
        
    }
}
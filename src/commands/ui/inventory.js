const { ApplicationCommandType, SelectMenuBuilder, ActionRowBuilder, ButtonBuilder, 
    ButtonStyle, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
let embedIndex = 0;
let currentEmbeds = [];

module.exports = {
    info: {
        name: "inventory",
        description: "Shows the player inventory",
        type: ApplicationCommandType.ChatInput,
        options: [{
            name: "player",
            type: ApplicationCommandOptionType.User,
            description: "The player's inventory you want to check"
        }]
    },
    async execute(app, interaction, data, embed) {
        let {player} = data;
        if(player == null) return await interaction.reply("You don't have data to use this command!");
        if(player.resting == true) return await interaction.reply("You are currently resting, you can't use other commands!");
        let guildMember = interaction.member;
        if(interaction.options.get("player")){
            guildMember = interaction.options.getMember("player");
            player = await app.db.users.findOne({id: guildMember.id}).exec();
            if(!player){
                await interaction.reply({content: "This user doesn't have data.", ephemeral: true});
                return;
            }
        }
        const title = `**${guildMember.user.tag}'s Inventory**`;
        embed.setTitle(title)
        .addFields(
            {name: "Select a Category in the Select Menu", value: "Categories:\nMaterials\nMisc\nBooks\nWeapons\nBait\nFood\nArmor\nJewelery\nPotions\nRunes\nGlyphs"}
        );
        const noItemEmbed = new EmbedBuilder().setTitle(title);
        noItemEmbed.addFields({name: `**No Items**`, value: `You don't have any items from this category`});
        let materials = []; let misc = []; let books = []; let weapons = [];
        let bait = []; let food = []; let armor = []; let jewelery = [];
        let potions = []; let runes = []; let glyphs = [];
        for( const [key, value] of player.inventory){
            if(value <= 0){
                player.inventory.delete(key);
            }else{
                const item = app.items.items.get(key);
                const name = item.displayName;
                let itemString = `**${name} ─ ${value}**`;
                if(item.group === 'materials') materials.push(itemString);
                if(item.group === 'misc') misc.push(itemString);
                if(item.group === 'books') books.push(itemString);
                if(item.group === 'weapons') weapons.push(itemString);
                if(item.group === 'bait') bait.push(itemString);
                if(item.group === 'food') food.push(itemString);
                if(item.group === 'armor') armor.push(itemString);
                if(item.group === 'jewelery') jewelery.push(itemString);
                if(item.group === 'potions') potions.push(itemString);
                if(item.group === 'runes') runes.push(itemString);
                if(item.group === 'glyphs') glyphs.push(itemString);
            }
        }
        await player.save();
        const selectMenuRow = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId("select")
                .setPlaceholder("Nothing selected")
                .addOptions(
                    {
                        label: "Materials",
                        description: "Shows materials in your inventory",
                        value: "materials"
                    },
                    {
                        label: "Misc",
                        description: "Shows misc items in your inventory",
                        value: "misc"
                    },
                    {
                        label: "Books",
                        description: "Shows books in your inventory",
                        value: "books"
                    },
                    {
                        label: "Weapons",
                        description: "Shows weapons in your inventory",
                        value: "weapons"
                    },
                    {
                        label: "Bait",
                        description: "Shows bait in your inventory",
                        value: "bait"
                    },
                    {
                        label: "Food",
                        description: "Shows food in your inventory",
                        value: "food"
                    },
                    {
                        label: "Armor",
                        description: "Shows armor in your inventory",
                        value: "armor"
                    },
                    {
                        label: "Jewelery",
                        description: "Shows jewelery in your inventory",
                        value: "jewelery"
                    },
                    {
                        label: "Potions",
                        description: "Shows potions in your inventory",
                        value: "potions"
                    },
                    {
                        label: "Runes",
                        description: "Shows runes in your inventory",
                        value: "runes"
                    },
                    {
                        label: "Glyphs",
                        description: "Shows glyphs in your inventory",
                        value: "glyphs"
                    },
            )
        );
        const buttonMenuRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                    .setCustomId("back")
                    .setLabel("<<")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
            new ButtonBuilder()
                    .setCustomId("forward")
                    .setLabel(">>")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true)
        );
        let reply = await interaction.reply({embeds: [embed], components: [selectMenuRow, buttonMenuRow], fetchReply: true});
        const filter = x => x.user.id === interaction.member.id;
        const collector = reply.createMessageComponentCollector({filter, idle: 30000});
        let materialEmbeds = []; let miscEmbeds = []; let booksEmbeds = []; let weaponsEmbed = [];
        let baitEmbeds = []; let foodEmbeds = []; let armorEmbeds = []; let jeweleryEmbeds = [];
        let potionsEmbeds = []; let runesEmbeds = []; let glyphsEmbeds = [];
        app.utility.enableButtons(buttonMenuRow);
        collector.on("collect", async (x) => {
            switch(x.componentType){
                case 3: // Select Menu
                    switch(x.values.shift()) {
                        case "materials":
                            sendEmbedCategories(materialEmbeds, title, materials, "Materials", reply, interaction, {selectMenuRow, buttonMenuRow}, noItemEmbed);
                        break;
                        case "misc":
                            sendEmbedCategories(miscEmbeds, title, misc, "Misc", reply, interaction, {selectMenuRow, buttonMenuRow}, noItemEmbed);
                        break;
                        case "books":
                            sendEmbedCategories(booksEmbeds, title, books, "Books", reply, interaction, {selectMenuRow, buttonMenuRow}, noItemEmbed);
                        break;
                        case "weapons":
                            sendEmbedCategories(weaponsEmbed, title, weapons, "Weapons", reply, interaction, {selectMenuRow, buttonMenuRow}, noItemEmbed);
                        break;
                        case "bait":
                            sendEmbedCategories(baitEmbeds, title, bait, "Bait", reply, interaction, {selectMenuRow, buttonMenuRow}, noItemEmbed);
                        break;
                        case "food":
                            sendEmbedCategories(foodEmbeds, title, food, "Food", reply, interaction, {selectMenuRow, buttonMenuRow}, noItemEmbed);
                        break;
                        case "armor":
                            sendEmbedCategories(armorEmbeds, title, armor, "Armor", reply, interaction, {selectMenuRow, buttonMenuRow}, noItemEmbed);
                        break;
                        case "jewelery":
                            sendEmbedCategories(jeweleryEmbeds, title, jewelery, "Jewelery", reply, interaction, {selectMenuRow, buttonMenuRow}, noItemEmbed);
                        break;
                        case "potions":
                            sendEmbedCategories(potionsEmbeds, title, potions, "Potions", reply, interaction, {selectMenuRow, buttonMenuRow}, noItemEmbed);
                        break;
                        case "runes":
                            sendEmbedCategories(runesEmbeds, title, runes, "Runes", reply, interaction, {selectMenuRow, buttonMenuRow}, noItemEmbed);
                        break;
                        case "glyphs":
                            sendEmbedCategories(glyphsEmbeds, title, glyphs, "Glyphs", reply, interaction, {selectMenuRow, buttonMenuRow}, noItemEmbed);
                        break;
                    }
                break;
                case 2: // Button
                    action(x, currentEmbeds, reply, interaction, {selectMenuRow, buttonMenuRow});
                break;
            }
            await x.update({components: [selectMenuRow, buttonMenuRow]});
        });
        collector.on("end", async() => {
            buttonMenuRow.components.map(x => x.setDisabled(true));
            selectMenuRow.components.map(x => x.setDisabled(true));
            await interaction.followUp("You ran out of time!");
        });
    }
}
async function sendEmbedCategories(categoryEmbed, title, category, string, reply, interaction, menuRows, noItemEmbed){
    let {selectMenuRow, buttonMenuRow} = menuRows;
    categoryEmbed = prepareEmbeds(title, category, string, categoryEmbed);
    if(categoryEmbed.length != 0){
        embedIndex = 0;
        currentEmbeds = [];
        currentEmbeds = categoryEmbed;
        reply = await interaction.editReply({embeds: [categoryEmbed[0]], components: [selectMenuRow, buttonMenuRow], fetchReply: true});
    }else{
        reply = await interaction.editReply({embeds: [noItemEmbed], components: [selectMenuRow, buttonMenuRow], fetchReply: true});
    }
}
function prepareEmbeds(title, itemCata, string, embeds){
    let category;
    let group;
    category = itemCata;
    group = string
    embeds = [];
    createEmbeds(title, category, group, embeds);
    return embeds;
}
async function createEmbeds(title, category, group, embeds){
    let count = 0;
    let index;
    for(let i = 0; i < category.length; i++){
        if(i == (0 + count)){
            let embed = new EmbedBuilder().setTitle(title);
            embeds.push(embed);
            count = count + 4;
            if(count == 4){
                index = 0;
            }else{
                index++;
            }
        }
        if(i < count) embeds[index].addFields({name: `${category[i]}`, value: `${group}`});
    }
}
async function action(component, embeds, reply, interaction, rows){
    let {selectMenuRow, buttonMenuRow} = rows;
    switch(component.customId){
        case "back":
            if(embedIndex == 0){
                embedIndex = embeds.length - 1;
            }else{
                embedIndex = embedIndex - 1;
            }
        break;
        case "forward":
            if(embedIndex == embeds.length - 1){
                embedIndex = 0
            }else{
                embedIndex = embedIndex + 1;
            }
        break;
    }
    reply = await interaction.editReply({embeds: [embeds[embedIndex]], components: [selectMenuRow, buttonMenuRow], fetchReply: true});
}
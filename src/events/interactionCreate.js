const { EmbedBuilder } = require("discord.js");

module.exports = async (app, interaction) => {
    const guildModel = app.db.guild;
    const playerModel = app.db.users;
    const embed = new EmbedBuilder().setTimestamp(interaction.createdTimestamp).setColor("#c68958");
    //let guild = await guildModel.findOneAndUpdate({id: interaction.guild.id}, {returnDocument: "after"}).exec();
    //let player = await playerModel.findOneAndUpdate({id: interaction.user.id}, {returnDocument: "after"}).exec();
    const command = app.commands.get(interaction.commandName);
    /*if(command.name !== "create" && player == null){
        await interaction.reply("You need to create data first! Use the create command.");
        return;
    }*/
    if(!interaction.inGuild()){
        await interaction.reply("Commands are not available in dms!");
        return;
    }
    try{
        await command.execute(app, interaction, /*{guild, player}*/ embed);
    }
    catch(err){
        console.log(err);
    }
}
const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    info: {
        name: "delete_channel",
        description: "deletes a channel",
        type: ApplicationCommandType.ChatInput,
        options: [{
            name: "id",
            description: "id of the channel",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "in",
            description: "give ID of the category",
            type: ApplicationCommandOptionType.String
        }]
    },
    async execute(app, interaction, data, embed, role) {
        try{
            if(app.utility.checkForStaffRole(interaction, role)) return;
            const channelId = interaction.options.getString("id");
            const categoryId = interaction.options.getString("in");
            const channels = interaction.guild.channels.cache;
            if(categoryId){
                const parent = channels.find(x => x.id == `${categoryId}`);
                if(!parent) return await interaction.reply("Category doesn't exist!");
                parent.children.cache.find(x => x.id == channelId).delete();
            }else{
                channels.find(x => x.id == channelId).delete();
            }
            await interaction.reply(`Deleted **${channels.find(x => x.id == channelId).name}** channel!`);
        }catch(err){
            console.log(err);
        }
    }
}
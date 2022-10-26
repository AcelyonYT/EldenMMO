const { ApplicationCommandType, ApplicationCommandOptionType, ChannelType } = require("discord.js");

module.exports = {
    info: {
        name: "create_channel",
        description: "creates a channel",
        type: ApplicationCommandType.ChatInput,
        options: [
            {
                name: "type",
                description: "text or voice channel?",
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    {
                        name: "Text",
                        value: "text"
                    },
                    {
                        name: "Voice",
                        value: "voice"
                    }
                ]
            },
            {
                name: "text",
                description: "name of the channel",
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: "category",
                description: "the Id of the category to put the channel under",
                type: ApplicationCommandOptionType.String,
            }
        ]
    },
    async execute(app, interaction, data, embed, role) {
        try{
            if(app.utility.checkForStaffRole(interaction, role)) return;
            const category = interaction.options.getString("category")
            const type = interaction.options.getString("type");
            const text = interaction.options.getString("text");
            let parent;
            if(category){
                parent = interaction.guild.channels.cache.find(x => x.id == `${category}`);
                if(!parent) return await interaction.reply({content: "Category doesn't exist!", ephemeral: true});
                createChannel({interaction, parent}, text, type);
            }else{
                createChannel({interaction, parent}, text, type);
            }
        }catch(err){
            console.log(err);
        }
    }
}
async function createChannel(data, text, type){
    let { interaction, parent } = data;
    if(parent){
        parent = parent.children;
    }else{
        parent = interaction.guild.channels;
    }
    switch(type){
        case "text":
            parent.create({
                type: ChannelType.GuildText,
                name: `${text}`
            })
        break;
        case "voice":
            parent.create({
                type: ChannelType.GuildVoice,
                name: `${text}`
            })
        break;
        default: return interaction.reply({content: "Invalid channel type", ephemeral: true})
    }
    await interaction.reply({content: `Created **${text}** ${type} channel!`, ephemeral: true});
}
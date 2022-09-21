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
                description: "the category to put the channel under if any",
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
            if(category){
                const parent = interaction.guild.channels.cache.find(x => x.name == `${category}`);
                if(!parent) return await interaction.reply("Category doesn't exist!");
                switch(type) {
                    case "text":
                        parent.children.create({
                            type: ChannelType.GuildText,
                            name: `${text}`
                        });
                    break;
                    case "voice":
                        parent.children.create({
                            type: ChannelType.GuildVoice,
                            name: `${text}`
                        });
                    break;
                    default: interaction.reply("Invalid channel type");
                }
                await interaction.reply(`Created **${text}** ${type} channel!`);
            }else{
                switch(type){
                    case "text":
                        interaction.guild.channels.create({
                            type: ChannelType.GuildText,
                            name: `${text}`
                        });
                    break;
                    case "voice":
                        interaction.guild.channels.create({
                            type: ChannelType.GuildVoice,
                            name: `${text}`
                        });
                    break;
                    default: interaction.reply("Invaild channel type");
                }
                await interaction.reply(`Created **${text}** ${type} channel!`);
            }
        }catch(err){
            console.log(err);
        }
    }
}
const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    info: {
        name: "ping",
        type: ApplicationCommandType.ChatInput,
        description: "send pong or embed",
        options: [{
            name: 'test',
            description: 'test',
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: "Test1",
                    value: "You did it"
                },
                {
                    name: "Test2",
                    value: "You did it again"
                }
            ]
        }]
    },
    async execute(app, interaction, embed){
        let option = interaction.options.getString("test");
        if(option){
            embed.setTitle("Pong!");
            embed.addFields({name: `${option}`, value: "Test"});
            await interaction.reply({embeds: [embed]});
        }else{
            await interaction.reply("Pong!");
        }
    }
}
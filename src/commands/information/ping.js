const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    info: {
        name: "ping",
        type: ApplicationCommandType.ChatInput,
        description: "send pong or embed",
        options: [{
            name: 'information',
            description: 'sends information or just pong',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: "Ping",
                    value: "ping"
                },
                {
                    name: "Pong",
                    value: "pong"
                }
            ]
        }]
    },
    async execute(app, interaction, data, embed){
        const option = interaction.options.getString("information");
        if(option == "ping"){
            embed.setTitle("🏓Pong!");
            embed.addFields(
                {name: "Latency:", value: `${Date.now() - interaction.createdTimestamp}ms`, inline: true},
                {name: "API Latency:", value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true}
            );
            await interaction.reply({embeds: [embed]});
        }else{
            await interaction.reply("Pong!");
        }
    }
}
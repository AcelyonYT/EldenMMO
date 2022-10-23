const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    info: {
        name: "ping",
        name_localizations: {
            de: "anpingen",
            "pt-BR": "ping",
            hu: "ping"
        },
        type: ApplicationCommandType.ChatInput,
        description: "send pong or embed",
        description_localizations: {
            de: "pong senden oder einbetten",
            "pt-BR": "enviar pong ou incorporar",
            hu: "pong küldése vagy beágyazása"
        },
        options: [{
            name: 'information',
            name_localizations: {
                de: "information",
                "pt-BR": "informação",
                hu: "információ"
            },
            description: 'sends information or just pong',
            description_localizations: {
                de: "sendet informationen oder einfach nur Pong",
                "pt-BR": "envia informações ou apenas pong",
                hu: "információt küld, vagy csak pong"
            },
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: "Ping",
                    name_localizations: {
                        de: "Anpingen",
                        "pt-BR": "Ping",
                        hu: "Ping"
                    },
                    value: "ping"
                },
                {
                    name: "Pong",
                    name_localizations: {
                        de: "Stinken",
                        "pt-BR": "Rio Pong",
                        hu: "Pong"
                    },
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
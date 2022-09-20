const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    info: {
        name: "purge",
        description: "purge messages",
        type: ApplicationCommandType.ChatInput,
        options: [
            {
                name: "user_messages",
                description: "purge the messages of a user",
                type: ApplicationCommandOptionType.Subcommand,
                options: [{
                    name: "user",
                    description: "deletes the messages",
                    type: ApplicationCommandOptionType.User,
                    required: true
                }, {
                    name: "amount",
                    description: "amount of messages to delete",
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    maxValue: 100,
                    minValue: 1
                }]
            },
            {
                name: "channel_messages",
                description: "purge recent messages from the channel",
                type: ApplicationCommandOptionType.Subcommand,
                options: [{
                    name: "amount",
                    description: "deletes the messages",
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    maxValue: 100,
                    minValue: 1
                }]
            }
        ]
    },
    execute(app, interaction, data, embed){
        if(!interaction.member.roles.cache.find(r => r.id === "1020932931197354026")) {
            interaction.reply("You cannot use this command!");
            return;
        }
        const commandType = interaction.options.getSubcommand();
        const number = interaction.options.getInteger("amount");
        if(commandType == "user_messages") {
            const user = interaction.options.getUser("user");
            userMessages(app, interaction, user, number);
        } else {
            channelMessages(app, interaction, number);
        }
    }
}

async function userMessages(app, interaction, user, number) {
    interaction.channel.messages.fetch({
        limit: number // set to a number <= 100
    }).then((messages) => {
        let userMessages = [];
        messages.filter(m => m.author.id === user.id).forEach(msg => userMessages.push(msg));
        app.utility.checkTwoWeeks(userMessages, interaction);
    });
}

async function channelMessages(app, interaction, number) {
    interaction.channel.messages.fetch({
        limit: number // set to a number <= 100
    }).then((messages) => {
        let channelMessages = [];
        messages.forEach(msg => channelMessages.push(msg));
        app.utility.checkTwoWeeks(channelMessages, interaction);
    });
}
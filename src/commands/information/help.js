const { ApplicationCommandType } = require("discord.js");

module.exports = {
    info: {
        name: "help",
        description: "Information about the bot!",
        type: ApplicationCommandType.ChatInput
    },
    execute(app, interaction, data, embed){

    }
}
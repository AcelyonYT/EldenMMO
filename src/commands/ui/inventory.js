const { ApplicationCommandType } = require("discord.js")

module.exports = {
    info: {
        name: "inventory",
        description: "Shows the player inventory",
        type: ApplicationCommandType.ChatInput
    },
    async execute(app, interaction, data, embed) {
        app.utility.checkForData(interaction, data);
    }
}
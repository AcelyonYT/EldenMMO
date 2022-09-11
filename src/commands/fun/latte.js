const { ApplicationCommandType } = require("discord.js");
const fs = require("fs");

module.exports = {
    info: {
        name: "latte",
        description: "random of the cat latte",
        type: ApplicationCommandType.ChatInput
    },
    async execute(app, interaction, embed) {
        let files = fs.readdirSync("src/static/lattepictures");
        let picture = files[Math.floor(Math.random() * files.length)];
        await interaction.reply({files: [`./src/static/lattepictures/${picture}`]});
    }
}
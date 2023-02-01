const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");

module.exports = {
    info: {
        name: "latte",
        name_localizations: {
            de: "milch",
            "pt-BR": "leite",
            hu: "tej"
        },
        description: "random pictures of the cat latte",
        description_localizations: {
            de: "zufällige Bilder vom Katzen-Latte",
            "pt-BR": "imagens aleatórias do latte gato",
            hu: "véletlenszerű képek a macska latte-ról"
        },
        type: ApplicationCommandType.ChatInput
    },
    async execute(app, interaction, data, embed) {
        let files = fs.readdirSync("src/static/lattepictures");
        let picture = files[app.utility.randomInt(0, files.length)];
        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("New")
                .setEmoji("🔄")
                .setStyle(ButtonStyle.Primary)
        );
        const reply = await interaction.reply({files: [`./src/static/lattepictures/${picture}`], components: [actionRow]});
        const filter = x => x.user.id === interaction.member.id;
        const collector = reply.createMessageComponentCollector({filter, idle: 120000});
        collector.on("collect", async (x) => {
            picture = files[app.utility.randomInt(0, files.length)];
            await x.update({files: [`./src/static/lattepictures/${picture}`], components: [actionRow]})
        });
        collector.on("end", async (x) => {
            await interaction.followUp("You were idle for too long!");
        })
    }
}
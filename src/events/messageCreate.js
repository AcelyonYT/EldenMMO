const { EmbedBuilder, MessageCollector } = require("discord.js");

module.exports = async (app, message) => {
    if(message.author.bot) return;

    const embed = new EmbedBuilder();

    const filter = m => m.author.id != message.author.bot;
    const collector = message.channel.createMessageCollector({ filter });

    /*collector.on("collect", m => {
        message.channel.send("hi");
    });*/
}
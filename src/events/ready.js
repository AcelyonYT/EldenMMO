const { ActivityType } = require("discord.js");

module.exports = async (app, client) => {
    console.log(`Logged in as ${client.user.tag}`);
    await app.client.application.commands.set(app.commands.map(x => x.info));
    app.client.user.setActivity("Creating Myself", {type: ActivityType.Watching});
}
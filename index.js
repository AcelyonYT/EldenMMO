require("dotenv").config();
const YtCommentBot = require("./src/app.js");
const bot = new YtCommentBot();
bot.launch();
process.on("SIGINT", async () => {
    await bot.db.db.close();
    console.log("Exiting the process.");
    process.exit(0);
})
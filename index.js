require("dotenv").config();
const EldenMMO = require("./src/app.js");
const bot = new EldenMMO();
bot.launch();
process.on(
    "SIGINT", async () => 
    {
        await bot.db.db.close();
        process.exit(0);
    }
);
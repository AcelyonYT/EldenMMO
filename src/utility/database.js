const mongoose = require("mongoose");

class Database {
    constructor(){
        this.db = mongoose.connection;
        this.users = this.db.model("user", require("../static/schema/userSchema"));
        this.guild = this.db.model("guild", require("../static/schema/guildSchema"));
    }
    loadDatabase(){
        mongoose.connect(process.env.DBURL, {useNewUrlParser: true, useUnifiedTopology: true});
    }
}

module.exports = Database;
const {Schema} = require("mongoose");

const guildSchema = new Schema({
    id: {type: String}
});

module.exports = guildSchema;
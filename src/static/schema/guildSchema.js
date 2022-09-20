const {Schema} = require("mongoose");

const guildSchema = new Schema({
    id: {type: String},
    name: {type: String}
});

module.exports = guildSchema;
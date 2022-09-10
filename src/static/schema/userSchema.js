const {Schema} = require("mongoose");

const userSchema = new Schema({
    id: {type: String}
});

module.exports = userSchema;
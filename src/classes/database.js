const mongoose = require("mongoose");

module.exports = class Database
{
    constructor()
    {
        this.db = mongoose.connection;
        this.users = this.db.model( "user", require( "../static/schema/userSchema" ) );
        this.guild = this.db.model( "guild", require( "../static/schema/guildSchema" ) );
    }
    loadDatabase()
    {
        mongoose.set( "strictQuery", true );
        this.db.once( "open", () => 
            {
                console.log( "Successfully connected to the database" );
            }
        );
        this.db.on( "error", ( err ) => 
            {
                console.log( `Error encountered on database connection: ${ err }` );
            }
        );
        mongoose.connect( process.env.DBURL, { useNewUrlParser: true, useUnifiedTopology: true } );
    }
}
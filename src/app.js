const {Client, GatewayIntentBits, Partials, Collection} = require("discord.js");
const fs = require("fs");
const Utility = require("./static/utility.js");
const Database = require("./utility/database.js");

class YtCommentBot {
    constructor(){
        this.client = new Client({intents: [GatewayIntentBits.Guilds], partials: [Partials.Channel]});
        this.commands = new Collection();
        this.utility = new Utility(this);
        this.db = new Database();
    }
    launch(){
        this.loadEvents();
        this.loadCommands();
        this.db.loadDatabase();
        this.client.login(process.env.TOKEN);
    }
    loadEvents(){
        const eventFiles = fs.readdirSync(__dirname + '/events').filter(file => file.endsWith(".js"));
        for( const file of eventFiles ){
            const event = require(`./events/${file}`);
            const eventName = event.name || file.split('.')[0];
            if(eventName == 'ready'){
                this.client.once('ready', event.bind(null, this));
            }
            else{
                this.client.on(eventName, event.bind(null, this));
            }
            delete require.cache[require.resolve(`./events/${file}`)];
        }
        console.log("Events have been loaded");
        this.db.db.on('connecting', function() {
            console.log("Connecting to the database");
        });
        this.db.db.on('connected', function() {
            console.log("Connected to the database");
        });
        this.db.db.on('disconnecting', function() {
            console.log("Disconnecting from the database");
        });
        this.db.db.on('disconnected', function() {
            console.log("Diconnected from the database");
        });
        console.log("Database has loaded");
    }
    loadCommands(){
        const categories = fs.readdirSync(__dirname + "/commands");
        for(const category of categories){
            let commandFiles = fs.readdirSync(__dirname + `/commands/${category}`).filter(file => file.endsWith(".js"));
            for(const file of commandFiles){
                const command = require(`./commands/${category}/${file}`);
                command.name = file.split('.')[0];
                command.category = category;
                this.commands.set(command.name, command);
            }
        }
        console.log("Slash commands have been loaded.");
    }
}

module.exports = YtCommentBot;
const { Collection } = require("discord.js");
const fs = require("fs");
class Items {
    constructor(app){
        this.app = app;
        this.items = new Collection();
    }
    loadItems(){
        const category = fs.readdirSync("C:\\Users\\Epicg\\Documents\\GitHub\\ytCommentsBot\\src\\static\\items").filter(file => file.endsWith(".json"));
        for(const group of category){
            const file = require(`C:\\Users\\Epicg\\Documents\\GitHub\\ytCommentsBot\\src\\static\\items\\${group}`);
            for(const item in file){
                file[item].group = group.split(".")[0];
                file[item].name = item;
                file[item].displayName = item.split("_").join(" ");
                file[item].lowerCaseName = item.toLowerCase();
                this.items.set(item, file[item]);
            }
        }
        console.log("All item files have been loaded");
    }
}

module.exports = Items;
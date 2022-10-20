const {Schema} = require("mongoose");

const userSchema = new Schema({
    id: {type: String},
    name: {type: String},
    crystals: {type: Number, default: 0, min: 0},
    coins: {type: Map, of: Number},
    health: {type: Number, default: 100.00, min: 0, max: 100},
    mana: {type: Number, default: 25.00, min: 0, max: 25},
    level: {type: Number, default: 1},
    cooldowns: {type: Map, of: Number},
    equipment: { // equip player is wearing
        rightHand1: {type: String}, // right hand 1 item
        rightHand2: {type: String}, // right hand 2 item
        leftHand1: {type: String}, // left hand 1 item
        leftHand2: {type: String}, // left hand 2 item
        arrow: [{type: String}], // arrows equipped, up to 2 can be equiped
        bolts: [{type: String}], // bolts equipped, up to 2 can be equiped
        helmet: {type: String}, // equipped helmet
        chest: {type: String}, // equipped chestplate
        hands: {type: String}, // equipped hand attire
        leggings: {type: String}, // equipped leggings
        trinkets: [{type: String}], // equipped trinkets, up to 1, can be increased by items in inventory
        pouch: [{type: String}] // equipped items in the pouch, up to 6
    },
    equipLoad: {type: Number},
    memory: [{type: String}], // equipped spells and incantations, up to 2, can be increased by items in the inventory
    inventory: {type: Map, of: Number}, // list of all items player have
    spellBook: {type: Map, of: Number}, // list of all spells and incanations player have, more than 1 will increase its effect
    pokeBox: {type: Map, of: Number}, // pokemon that you have
    pokemon: { // your 6 active pokemon
        one: {type: String},
        two: {type: String},
        three: {type: String},
        four: {type: String},
        five: {type: String},
        six: {type: String}
    },
    // Stats
    vigor: {type: Number, default: 8}, // handles health and immunity and fire
    mind: {type: Number, default: 8}, // handles mana
    endurance: {type: Number, default: 8}, // handles equip load and robust
    strength: {type: Number, default: 8}, // scaling stat, handles physical defense
    dexerity: {type: Number, default: 8}, // scaling stat, reduce spell time (aka some number to apply to lower dodge chance)
    intelligence: {type: Number, default: 8}, //scaling stat, handles magic resist 
    faith: {type: Number, default: 8}, //scaling stat, handles holy defense and vitality
    immunity: {type: Number, default: 10}, // handles poison
    vitality: {type: Number, default: 10}, // handles instant death
    robust: {type: Number, default: 10}, // handles bloodloss and frostbite
    focus: {type: Number, default: 10}, // handles sleep
    poise: {type: Number, default: 5}, // handles stun
    physical: {type: Number, default: 5.00}, // handles damage reduction
    pierce: {type: Number, default: 2.50}, // handles damage reduction against this type of weapon
    slash: {type: Number, default: 2.50}, // handles damage reduction against this type of weapon
    blunt: {type: Number, default: 2.50}, // handles damage reduction against this type of weapon
    magic: {type: Number, default: 1.30}, // handles resistance against magic
    fire: {type: Number, default: 1.10}, // handles resistance against fire
    lightning: {type: Number, default: 1.20}, // handles resistance against lightning
    holy: {type: Number, default: 1.40}, // handles resisit against holy
    // Status effects
    bloodLoss: {type: Number, default: 0, min: 0, max: 100}, // handles bloodlose buildup
    frostbite: {type: Number, default: 0, min: 0, max: 100}, // handles frostbite buildup
    poison: {type: Number, default: 0, min: 0, max: 100}, // handles poison buildup
    sleep: {type: Number, default: 0, min: 0, max: 100}, // handles sleep buildup
    death: {type: Number, default: 0, min: 0, max: 100}, // handles death buildup
    stun: {type: Number, default: 0, min: 0, max: 100} // handles stun buildup
});

userSchema.methods.updateInventory = function(itemName, quantity){
    if(this.inventory.has(itemName)){
        const amount = this.inventory.get(itemName) + quantity;
        if(amount <= 0){
            this.inventory.delete(itemName);
        }
        else{
            this.inventory.set(itemName, amount);
        }
    }
    else{
        if(quantity > 0){
            this.inventory.set(itemName, quantity);
        }
    }
}

module.exports = userSchema;
const {Schema} = require("mongoose");

const userSchema = new Schema({
    // Identifiers
    id: {type: String},
    name: {type: String},
    // Currency
    wallet: {type: Map, of: Number},
    bank: {type: Map, of: Number},
    // Resource
    health: {type: Number, default: 414, min: 0},
    maxHealth: {type: Number, default: 414},
    chi: {type: Number, default: 78, min: 0},
    maxChi: {type: Number, default: 78},
    stamina: {type: Number, default: 96, min: 0},
    maxStamina: {type: Number, default: 96},
    // Level
    crystals: {type: Number, default: 0, min: 0},
    level: {type: Number, default: 1},
    cooldowns: {type: Map, of: Number}, // cooldowns for commands
    equipment: { // equip player is wearing
        // weapons
        rightHand1: {type: String}, // right hand 1 item
        rightHand2: {type: String}, // right hand 2 item
        leftHand1: {type: String}, // left hand 1 item
        leftHand2: {type: String}, // left hand 2 item
        arrow: [{type: String}], // arrows equipped, up to 2 can be equiped
        bolts: [{type: String}], // bolts equipped, up to 2 can be equiped
        // armor
        helmet: {type: String}, // equipped helmet
        chest: {type: String}, // equipped chestplate
        hands: {type: String}, // equipped hand attire
        leggings: {type: String}, // equipped leggings
        // side items
        trinkets: [{type: String}], // equipped trinkets, up to 1, can be increased by items in inventory
        pouch: [{type: String}] // equipped items in the pouch, up to 6
    },
    equipLoad: {type: Number, default: 0.0}, // restricts what you can wear without negative effects
    memory: [{type: String}], // equipped spells and incantations, up to 2, can be increased by items in the inventory
    inventory: {type: Map, of: Number}, // list of all items player have
    spellBook: {type: Map, of: Number}, // list of all spells and incanations player have, more than 1 will increase its effect
    // pokemon
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
    vigor: {type: Number, default: 10}, // handles health and immunity and fire
    mind: {type: Number, default: 10}, // handles mana
    endurance: {type: Number, default: 10}, // handles equip load and robust
    strength: {type: Number, default: 10}, // scaling stat, handles physical defense
    dexerity: {type: Number, default: 10}, // scaling stat, reduce spell time (aka some number to apply to lower dodge chance)
    intelligence: {type: Number, default: 10}, //scaling stat, handles magic resist 
    faith: {type: Number, default: 10}, //scaling stat, handles holy defense and vitality
    immunity: {type: Number, default: 90}, // handles poison
    immunityArmor: {type: Number, default: 0}, // immunity from armor
    vitality: {type: Number, default: 100}, // handles instant death
    vitalityArmor: {type: Number, default: 0}, // vitality from armor
    robust: {type: Number, default: 90}, // handles bloodloss and frostbite
    robustArmor: {type: Number, default: 0}, // robust from armor
    focus: {type: Number, default: 90}, // handles sleep
    focusArmor: {type: Number, default: 0}, // focus from armor
    poise: {type: Number, default: 5}, // handles stun
    physical: {type: Number, default: 0.0}, // handles damage reduction percent
    physicalDef: {type: Number, default: 75.0}, // handles damage reduction
    pierce: {type: Number, default: 0.0}, // handles damage reduction against this type of weapon percent
    pierceDef: {type: Number, default: 75.0}, // handles damage reduction
    slash: {type: Number, default: 0.0}, // handles damage reduction against this type of weapon percent
    slashDef: {type: Number, default: 75.0}, // handles damage reduction
    blunt: {type: Number, default: 0.0}, // handles damage reduction against this type of weapon percent
    bluntDef: {type: Number, default: 75.0}, // handles damage reduction
    magic: {type: Number, default: 0.0}, // handles resistance against magic
    magicDef: {type: Number, default: 91.0}, // handles damage reduction
    fire: {type: Number, default: 0.0}, // handles resistance against fire
    fireDef: {type: Number, default: 78.0}, // handles damage reduction
    lightning: {type: Number, default: 0.0}, // handles resistance against lightning
    lightningDef: {type: Number, default: 71.0}, // handles damage reduction
    holy: {type: Number, default: 0.0}, // handles resisit against holy
    holyDef: {type: Number, default: 91.0}, // handles damage reduction
    // Status effects
    bloodLoss: {type: Number, default: 0, min: 0, max: 100}, // handles bloodlose buildup
    frostbite: {type: Number, default: 0, min: 0, max: 100}, // handles frostbite buildup
    poison: {type: Number, default: 0, min: 0, max: 100}, // handles poison buildup
    sleep: {type: Number, default: 0, min: 0, max: 100}, // handles sleep buildup
    death: {type: Number, default: 0, min: 0, max: 100}, // handles death buildup
    stun: {type: Number, default: 0, min: 0, max: 100}, // handles stun buildup
    // Professions
    professions: {type: Map, of: Number}, // list of all player professions
    // Recipes will be an Array of Objects which will hold properties of a recipe
    recipes: [
        {
            name: {type: String}, // display name
            tier: {type: Number}, // what tier
            materials: {type: Map, of: Number}, // items required
            item: {type: String}, // actual item name
            value: {type: Map, of: Number} // how much coins
        }
    ],
    enchantments: [
        {
            name: {type: String}, // display name
            tier: {type: Number}, // what tier
            enchantment: {type: String}, // actual item name
            value: {type: Map, of: Number} // how much coins
        }
    ]
});
userSchema.methods.updateStamina = function(amount){
    let maxStam = getMaxStamina(this.endurance);
    if(this.stamina + amount >= maxStam){
        this.stamina = maxStam;
    }else if(this.stamina + amount <= 0){
        this.stamina = 0;
    }else{
        this.stamina = this.stamina + amount;
    }
}
userSchema.methods.updateHealth = function(amount){
    let maxHp = getMaxHealth(this.vigor);
    if(this.health + amount >= maxHp){
        this.health = maxHp;
    }else if(this.health + amount <= 0){
        this.health = 0;
    }else{
        this.health = this.health + amount;
    }
}
userSchema.methods.updateChi = function(amount){
    let maxChi = getMaxChi(this.mind);
    if(this.chi + amount >= maxChi){
        this.chi = maxChi;
    }else if(this.chi + amount <= 0){
        this.chi = 0;
    }else{
        this.chi = this.chi + amount;
    }
}
function getMaxStamina(endurance){
    if(endurance >= 1 && endurance <= 15){
        return Math.floor(80 + (25*((endurance - 1) / 14)));
    }else if(endurance >= 16 && endurance <= 35){
        return Math.floor(105 + (25*((endurance - 15) / 15)));
    }else if(endurance >= 36 && endurance <= 60){
        return Math.floor(130 + (25*((endurance - 30) / 20)));
    }else{
        return Math.floor(155 + (15*((endurance - 50) / 49)));
    }
}
function getMaxChi(mind){
    if(mind >= 1 && mind <= 15){
        return Math.floor(50 + (45*((mind - 1) / 14)));
    }else if(mind >= 16 && mind <= 35){
        return Math.floor(95 + (105*((mind - 15) / 20)));
    }else if(mind >= 36 && mind <= 60){
        return Math.floor(200 + (150*(1 - (1 - ((mind - 35) / 25))**1.2)));
    }else{
        return Math.floor(350 + (100*((mind - 60) / 39)));
    }
}
function getMaxHealth(vigor){
    if(vigor >= 1 && vigor <= 25){
        return Math.floor(300 + (500*(((vigor - 1) / 24)**1.5)));
    }else if(vigor >= 26 && vigor <= 40){
        return Math.floor(800 + (650*(((vigor - 25) / 15)**1.1)));
    }else if(vigor >= 41 && vigor <= 60){
        return Math.floor(1450 + (450*(1 -(1 - ((vigor - 40) / 20))**1.2)));
    }else{
        return Math.floor(1900 + (200*(1 -(1 - ((vigor - 60) / 39))**1.2)));
    }
}
userSchema.methods.updateRecipes = function(name, tier, materials, item, value){
    let recipe = {
        name: name,
        tier: tier,
        materials: materials,
        item: item,
        value: value
    }
    this.recipes.push(recipe);
}
userSchema.methods.updateEnchantments = function(name, tier, enchantment, value){
    let enchantments = {
        name: name,
        tier: tier,
        enchantment: enchantment,
        value: value
    }
    this.enchantments.push(enchantments);
}
userSchema.methods.updateProfession = function(name, amount) {
    if(this.professions.has(name)){
        this.professions.set(name, this.professions.get(name) + amount);
    }else{
        this.professions.set(name, amount);
    }
}
userSchema.methods.removeProfession = function(profession) {
    this.professions.delete(profession);
}
userSchema.methods.updateInventory = function(itemName, quantity){
    if(this.inventory.has(itemName)){
        const amount = this.inventory.get(itemName) + quantity;
        if(amount <= 0){
            this.inventory.delete(itemName);
        }
        else{
            this.inventory.set(itemName, amount);
        }
    }else{
        if(quantity > 0){
            this.inventory.set(itemName, quantity);
        }
    }
}
userSchema.methods.updateWallet = function(gold, silver, copper){
    update("copper", "silver", "gold", copper, silver, gold, this.wallet);
}
userSchema.methods.updateBank = function(gold, silver, copper){
    update("copper", "silver", "gold", copper, silver, gold, this.bank);
}
userSchema.methods.updateWalletConvertHighToLow = function(copper, silver, gold, curCop, curSil, curGold, newCopVal, newSilVal, newGolVal){
    newGolVal = curGold - gold;
    if(curSil <= silver && curGold > 0){
        while(curSil <= silver && curGold > 0){
            curSil = curSil + 100;
            gold -= 1;
        }
    }
    newSilVal = curSil - silver;
    if(curCop < copper){
        while(curCop < copper){
            curCop = curCop + 100;
            newSilVal -= 1;
        }
    }
    newCopVal = curCop - copper;
    this.wallet.set("copper", newCopVal);
    this.wallet.set("silver", newSilVal);
    this.wallet.set("gold", newGolVal);
}
function update(string1, string2, string3, copper, silver, gold, map){
    while(silver >= 100){
        gold += 1;
        silver -= 100;
    }
    while(copper >= 100){
        silver += 1;
        copper -= 100;
    }
    updateCoin(string1, copper, map);
    updateCoin(string2, silver, map);
    updateCoin(string3, gold, map);
}
function updateCoin(coinType, coin, coinCollection){
    if(coinCollection.has(coinType)){
        const amount = coinCollection.get(coinType) + coin;
        if(amount <= 0){
            coinCollection.set(coinType, 0);
        }else{
            coinCollection.set(coinType, amount);
        }
    }else{
        if(coin > 0){
            coinCollection.set(coinType, coin);
        }else{
            coinCollection.set(coinType, 0);
        }
    }
    while(coinCollection.get("silver") >= 100 || coinCollection.get("copper") >= 100 ){
        let higherCoin = 0;
        let newCoin = 0;
        if(coinCollection.get("silver") >= 100){
            convertCoin("silver", "gold", newCoin, higherCoin, coinCollection);
        }
        if(coinCollection.get("copper") >= 100){
            convertCoin("copper", "silver", newCoin, higherCoin, coinCollection);
        }
    }
}
function convertCoin(type, higherType, newCoin, higherCoin, coinCollection){
    higherCoin += 1;
    newCoin = coinCollection.get(type) - 100;
    coinCollection.set(type, newCoin);
    coinCollection.set(higherType, coinCollection.get(higherType) + higherCoin);
}

module.exports = userSchema;
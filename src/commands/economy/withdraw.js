const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    info: {
        name: "withdraw",
        description: "Withdraw money from your bank",
        type: ApplicationCommandType.ChatInput,
        options: [
            {
                name: "copper",
                description: "amount of copper coins you want to withdraw",
                type: ApplicationCommandOptionType.Integer,
                minValue: 1,
                maxValue: 99
            },
            {
                name: "silver",
                description: "amount of silver coins you want to withdraw",
                type: ApplicationCommandOptionType.Integer,
                minValue: 1,
                maxValue: 99
            },
            {
                name: "gold",
                description: "amount of gold coins you want to withdraw",
                type: ApplicationCommandOptionType.Integer,
                minValue: 1
            }
        ]
    },
    async execute(app, interaction, data, embed) {
        const {player} = data;
        if(player == null) return await interaction.reply("You don't have data to use this command!");
        let copper = interaction.options.getInteger("copper");
        let silver = interaction.options.getInteger("silver");
        let gold = interaction.options.getInteger("gold");
        let haveCoins;
        if(!copper && !silver && !gold){
            return await interaction.reply({content: "You need to put the amount of coins you want to withdraw"});
        }else if(copper && !silver && !gold){
            haveCoins = checkForCoin(player, interaction, "copper");
            if(haveCoins == 0) return;
            withdraw(player, copper, 0, 0);
            await interaction.reply({content: `You withdrew **${copper}** copper coins.`});
        }else if(copper && silver && !gold){
            haveCoins = checkForCoin(player, interaction, "copper");
            if(haveCoins == 0) return;
            haveCoins = checkForCoin(player, interaction, "silver");
            if(haveCoins == 0) return;
            withdraw(player, copper, silver, 0);
            await interaction.reply({content: `You withdrew **${copper}** copper coins and **${silver}** silver coins.`});
        }else if(copper && !silver && gold){
            haveCoins = checkForCoin(player, interaction, "copper");
            if(haveCoins == 0) return;
            haveCoins = checkForCoin(player, interaction, "gold");
            if(haveCoins == 0) return;
            withdraw(player, copper, 0, gold);
            await interaction.reply({content: `You withdrew **${copper}** copper coins and **${gold}** gold coins.`});
        }else if(!copper && silver && !gold){
            haveCoins = checkForCoin(player, interaction, "silver");
            if(haveCoins == 0) return;
            withdraw(player, 0, silver, 0);
            await interaction.reply({content: `You withdrew **${silver}** silver coins.`});
        }else if(!copper && silver && gold){
            haveCoins = checkForCoin(player, interaction, "silver");
            if(haveCoins == 0) return;
            haveCoins = checkForCoin(player, interaction, "gold");
            if(haveCoins == 0) return;
            withdraw(player, 0, silver, gold);
            await interaction.reply({content: `You withdrew **${silver}** silver coins and **${gold}** gold coins.`});
        }else if(copper && silver && gold){
            haveCoins = checkForCoin(player, interaction, "copper");
            if(haveCoins == 0) return;
            haveCoins = checkForCoin(player, interaction, "silver");
            if(haveCoins == 0) return;
            haveCoins = checkForCoin(player, interaction, "gold");
            if(haveCoins == 0) return;
            withdraw(player, copper, silver, gold);
            await interaction.reply({content: `You withdrew **${copper}** copper coins, **${silver}** silver coins, and **${gold}** gold coins.`});
        }else{
            haveCoins = checkForCoin(player, interaction, "gold");
            if(haveCoins == 0) return;
            withdraw(player, 0, 0, gold, interaction);
            await interaction.reply({content: `You withdrew **${gold}** gold coins`});
        }
    }
}
function withdraw(player, copper, silver, gold){
    player.updateWallet(gold, silver, copper);
    player.updateBank(-gold, -silver, -copper);
    player.save();
}
function checkForCoin(player, interaction, type){
    if(player.bank.get(type) <= 0) { 
        interaction.reply({content: `You don't have that many ${type} coins to withdraw!`, ephemeral: true});
        return 0;
    }
    return 1;
}
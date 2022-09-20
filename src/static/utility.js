class Utility {
    constructor(app){
        this.app = app;
    }

    checkTwoWeeks(array, interaction){
        for(let i = 0; i < array.length; i++){
            if( (Date.now() - array[i].createdTimestamp) >= 1209600000) { // 14 days
                array.splice(i);
                break;
            }else{
                continue;
            }
        }
        if(array.length === 0){
            interaction.reply("Cannot delete messages that are more than 2 weeks old");
        } else {
            interaction.channel.bulkDelete(array).then(() => {
                interaction.reply(`Cleared **${array.length}** messages!`);
            });
        }
        return;
    }

    async checkForData(interaction, data){
        const {player} = data;
        if( player == null) {
            await interaction.reply("You don't have any data on this bot!");
        }
    }
}

module.exports = Utility;
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

    enableButtons(buttonMenuRow){
        for(let i = 0; i < buttonMenuRow.components.length; i++){
            buttonMenuRow.components[i].setDisabled(false);
        }
    }

    checkForStaffRole(interaction, role){
        if(!role) {
            interaction.reply("You cannot use this command!");
            return true;
        }else{
            return false;
        }
    }

    randomInt(min, max){
        return Math.floor(Math.random() * (max - min) ) + min;
    }

    upperCaseEachWord(string){
        return string.toLowerCase().split(" ").map(word => word.charAt(0).toUpperCase() + word.substring(1)).join("_");
    }
}

module.exports = Utility;
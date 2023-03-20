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

    enableButtons(buttonMenuRow){ return buttonMenuRow.components.forEach( x => x.setDisabled(false)); }

    disableButtons(buttonMenuRow){ return buttonMenuRow.components.forEach( x => x.setDisabled(true)); }

    enableButtonId(buttonMenuRow, id){ return buttonMenuRow.components.forEach( x => { if(x.data.custom_id == id) x.setDisabled(false); }); }

    disableButtonId(buttonMenuRow, id){ return buttonMenuRow.components.forEach( x => { if(x.data.custom_id == id) x.setDisabled(true); }); }

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

    addOptions(labels, descriptions, values, selectMenuRow, max, offset){
        for(let i = 0; i < max; i++){
            let newIndex = i + offset;
            if(!labels[newIndex]){
                break;
            }
            selectMenuRow.components[0].addOptions(
                {
                    label: labels[newIndex],
                    description: descriptions[newIndex],
                    value: values[newIndex]
                }
            );
        }
        return selectMenuRow;
    }
}

module.exports = Utility;
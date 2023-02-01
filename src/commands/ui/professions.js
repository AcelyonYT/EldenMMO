const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    info: {
        name: "professions",
        description: "View your professions.",
        type: ApplicationCommandType.ChatInput,
        options: [{
            name: "player",
            type: ApplicationCommandOptionType.User,
            description: "The player's professions you want to check"
        }]
    },
    async execute(app, interaction, data, embed){
        let {player} = data;
        if(player == null) return await interaction.reply("You don't have data to use this command!");
        let guildMember = interaction.member;
        if(interaction.options.get("player")){
            guildMember = interaction.options.getMember("player");
            player = await app.db.users.findOne({id: guildMember.id}).exec();
            if(!player){
                await interaction.reply({content: "This user doesn't have data.", ephemeral: true});
                return;
            }
        }
        const title = `**${guildMember.user.tag}'s Professions**`;
        embed.setTitle(title);
        let skilledPro = [
            "blacksmithing", "leatherworking", "woodworking", "mining", "herbalism", "alchemy",
            "enchanting", "runecrafting", "logging", "skinning", "tailoring", "jewelcrafting",
            "engineering", "inscription"
        ];
        let lifeProfessions = ["survival", "cooking", "firstaid", "fishing"];
        let skilledProString = ""; let lifeProfessionsString = "";
        let num = 0;
        for(let i = 0; i < skilledPro.length; i++){
            if(player.professions.get(skilledPro[i]) != null){
                skilledProString = skilledProString + `${skilledPro[i]}: ${player.professions.get(skilledPro[i])}\n`;
                num += 1;
            }
        }
        if(num < 2){
            if(num == 0){
                skilledProString = skilledProString + "Empty Slot\n";
            }
            skilledProString = skilledProString + "Empty Slot";
        }
        embed.addFields({name: "Skill Professions", value: `${skilledProString}`});
        num = 0;
        for(let i = 0; i < lifeProfessions.length; i++){
            if(player.professions.get(lifeProfessions[i]) != null){
                lifeProfessionsString = lifeProfessionsString + `${lifeProfessions[i]}: ${player.professions.get(lifeProfessions[i])}\n`;
                num += 1;
            }
        }
        if(num < lifeProfessions.length){
            for(let i = 0; i < (4 - num); i++){
                lifeProfessionsString = lifeProfessionsString + "Empty Slot\n";
            }
        }
        embed.addFields({name: "Life Professions", value: `${lifeProfessionsString}`});
        await interaction.reply({embeds: [embed]});
    }
}
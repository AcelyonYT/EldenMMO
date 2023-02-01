const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    info: {
        name: "balance",
        description: "Check your bank and wallet",
        type: ApplicationCommandType.ChatInput,
        options: [{
            name: "player",
            type: ApplicationCommandOptionType.User,
            description: "The player's inventory you want to check"
        }]
    },
    async execute(app, interaction, data, embed) {
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
        let copper = player.wallet.get("copper");
        let silver = player.wallet.get("silver");
        let gold = player.wallet.get("gold");
        let bankCopper = player.bank.get("copper");
        let bankSilver = player.bank.get("silver");
        let bankGold = player.bank.get("gold");
        embed.setTitle(`${guildMember.user.tag}'s Balance`).addFields(
            {name: "Wallet", value: `**Copper:** ${copper}\n**Silver:** ${silver}\n**Gold:** ${gold}`, inline: true},
            {name: "Bank", value: `**Copper:** ${bankCopper}\n**Silver:** ${bankSilver}\n**Gold:** ${bankGold}`, inline: true}
        );
        await interaction.reply({embeds: [embed]});
        await player.save();
    }
}
const { ApplicationCommandType, ApplicationCommandOptionType, ChannelType } = require("discord.js");

module.exports = {
    info: {
        name: "create_category",
        description: "creates a category",
        type: ApplicationCommandType.ChatInput,
        options: [
            {
                name: "text",
                description: "enter the name of the category",
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
    async execute(app, interaction, data, embed, role) {
        if(app.utility.checkForStaffRole(interaction, role)) return;
        const text = interaction.options.getString("text");
        interaction.guild.channels.create({name: `${text}`, type: ChannelType.GuildCategory });
        await interaction.reply({content: `Created **${text}** category!`, ephemeral: true});
    }
}
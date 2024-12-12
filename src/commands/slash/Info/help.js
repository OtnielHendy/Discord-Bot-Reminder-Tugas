const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View all the possible commands!'),
    options: {
        cooldown: 15000
    },
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {

        await interaction.deferReply();

        let prefix = process.env.prefix;

        const mapIntCmds = client.applicationcommandsArray.map((v) => `${process.env.arrow_green_emoji} \`${(v.type === 2 || v.type === 3) ? '' : '/'}${v.name}\`: ${v.description || '(No description)'}`);
        const mapPreCmds = client.collection.prefixcommands.map((v) => `${process.env.arrow_green_emoji} \`${prefix}${v.structure.name}\` (${v.structure.aliases.length > 0 ? v.structure.aliases.map((a) => `**${a}**`).join(', ') : 'None'}): ${v.structure.description || '(No description)'}`);

        await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${process.env.exclamation_emoji} HELP COMMAND ${process.env.exclamation_emoji}`)
                    .addFields(
                        { name: `${process.env.crown_yellow_emoji} Slash Commands ${process.env.crown_yellow_emoji}`, value: `${mapIntCmds.join('\n')}` },
                        { name: `${process.env.crown_yellow_emoji} Prefix Commands ${process.env.crown_yellow_emoji}`, value: `${mapPreCmds.join('\n')}` }
                    )
            ]
        });

    }
};

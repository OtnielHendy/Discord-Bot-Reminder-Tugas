const { Message, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config');
const fs = require('fs'); // Import the 'fs' module to work with files and directories

module.exports = {
    structure: {
        name: 'help',
        description: 'View All Commands!',
        aliases: ['h'],
        cooldown: 15000
    },
    /**
     * @param {ExtendedClient} client 
     * @param {Message<true>} message 
     * @param {string[]} args 
     */
    run: async (client, message, args) => {

        let prefix = process.env.prefix;

        
        // Get a list of files in the 'developers' directory
        const developerCommands = fs.readdirSync('./src/commands/prefix/Developer').filter(file => file.endsWith('.js'));

        const mapIntCmds = client.applicationcommandsArray.map((v) => `${process.env.arrow_green_emoji} \`${(v.type === 2 || v.type === 3) ? '' : '/'}${v.name}\`: ${v.description || '(No description)'}`);
        const mapPreCmds = client.collection.prefixcommands
            .filter((v) => !developerCommands.includes(`${v.structure.name}.js`)) // Exclude commands in the 'developers' folder
            .map((v) => `${process.env.arrow_green_emoji} \`${prefix}${v.structure.name}\` (${v.structure.aliases.length > 0 ? v.structure.aliases.map((a) => `**${a}**`).join(', ') : 'None'}): ${v.structure.description || '(No description)'}`);

        await message.reply({
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

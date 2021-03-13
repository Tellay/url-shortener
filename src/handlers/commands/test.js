const Client = require('../../client/index');
const { Message } = require('discord.js');

module.exports = {
    name: 'test',
    
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    
    run: async (client, message, args) => {
        message.reply('Eai gente boa!');
    }
}
const { Message } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const Tugas = require('../../../models/tugasSchema');

module.exports = {
    structure: {
        name: 'addtugas',
        description: 'Tambahkan Tugas!',
        aliases: ['add'],
        cooldown: 5000
    },
    /**
     * @param {ExtendedClient} client 
     * @param {Message<true>} message 
     * @param {string[]} args 
     */
    run: async (client, message) => {
        let prefix = process.env.prefix;

        const args = message.content.split(' ').slice(1);
        if (args.length < 4) {
            return message.reply(`**Format Salah!**\nGunakan ${prefix}addtugas <tanggal> <jam> <tugas> <url>`);
        }

        const [tanggal, jam, ...rest] = args;
        const tugas = rest.slice(0, -1).join(' ');
        const url = rest[rest.length - 1];

        const [day, month, year] = tanggal.split('-');
        const parsedTanggal = new Date(`${year}-${month}-${day}`);
        if (isNaN(parsedTanggal)) {
            return message.reply('**Format Tanggal Salah!**\nGunakan Format DD-MM-YYYY');
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return message.reply('**URL Tidak Valid!**\nPastikan Dimulai Dengan "http://" atau "https://"');
        }

        try {
            const existingTugas = await Tugas.findOne({ url });
            if (existingTugas) {
                return message.reply('**Tugas Dengan URL Ini Sudah Ada Di Database!**');
            }

            const newTugas = new Tugas({
                tanggal: parsedTanggal,
                jam: jam,
                tugas: tugas,
                url: url,
            });

            await newTugas.save();
            message.reply('Tugas berhasil ditambahkan ke database!');
        } catch (error) {
            console.error(error);
            message.reply('Terjadi kesalahan saat menambahkan tugas.');
        }
    }
};

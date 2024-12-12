const { Message, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const Tugas = require('../../../models/tugasSchema');
const { log } = require('../../../functions');

module.exports = {
    structure: {
        name: 'listtugas',
        description: 'Replies with a list of tasks!',
        aliases: ['list'],
        cooldown: 5000
    },
    /**
     * @param {ExtendedClient} client 
     * @param {Message<true>} message 
     * @param {string[]} args 
     */
    run: async (client, message, args) => {
        try {
            const now = new Date();
            now.setMilliseconds(0);

            const startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);

            const tugasList = await Tugas.find({
                tanggal: { $gte: startOfDay },
            }).sort({ tanggal: 1, jam: 1 });

            if (!Array.isArray(tugasList) || tugasList.length === 0) {
                const embed = new EmbedBuilder()
                    .setTitle('📚 Daftar Tugas 📚')
                    .setDescription("**Tidak Ada Tugas Untuk Saat Ini!**")
                    .setColor("Random")
                    .setTimestamp()
                    .setFooter({ text: `Requested By ${message.author.username}`, iconURL: message.author.displayAvatarURL() });
                return message.reply({ embeds: [embed] });
            }

            const getRemainingTime = (deadline) => {
                const diff = deadline - now;

                if (diff < 0) return null;

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                return `${days} Hari ${hours} Jam ${minutes} Menit ${seconds} Detik`;
            };

            const embed = new EmbedBuilder()
                .setTitle('📚 Daftar Tugas 📚')
                .setColor("Random")
                .setTimestamp()
                .setFooter({ text: `Requested By ${message.author.username}`, iconURL: message.author.displayAvatarURL() });

            let tasksDisplayed = false;
            tugasList.forEach((tugas, index) => {
                const tanggal = tugas.tanggal instanceof Date ? tugas.tanggal.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Invalid Date';

                const [hour, minute] = tugas.jam ? tugas.jam.split(':').map(Number) : [0, 0];
                const deadlineDate = new Date(tugas.tanggal);
                deadlineDate.setHours(hour, minute, 0, 0);

                const remainingTime = getRemainingTime(deadlineDate);

                if (remainingTime === null) return;

                embed.addFields({
                    name: `${index + 1}. ${tugas.tugas}`,
                    value: `🗓️ **${tanggal} - ${tugas.jam}**\n⏳ **${remainingTime}**\n🔗 [Link Tugas](${tugas.url})`,
                });

                tasksDisplayed = true;
            });

            if (!tasksDisplayed) {
                embed.setDescription("**Tidak Ada Tugas Untuk Saat Ini!**");
            }

            message.reply({ embeds: [embed] });
            log(`${message.author.tag} Check Tugas!`, 'info');
        } catch (error) {
            console.error('Error in listtugas command:', error);
            message.reply({ content: 'An Error Occurred When Checking Tasks. Please DM Admin To Report This Error.' });
        }
    }
};

const { log } = require("../../functions");
const ExtendedClient = require('../../class/ExtendedClient');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const Tugas = require('../../models/tugasSchema');

module.exports = {
    event: 'ready',
    once: true,
    /**
     * 
     * @param {ExtendedClient} _ 
     * @param {import('discord.js').Client<true>} client 
     * @returns 
     */
    run: async (_, client) => {
        log('Login As ' + client.user.tag, 'done');

        const jsonFilePath = path.resolve(__dirname, '../../config.json');
        const jsonData = readOrInitializeJson(jsonFilePath);

        if (!jsonData.channelId || !jsonData.channelReminder) {
            log('Channel ID or Channel Reminder not set in JSON file.', 'error');
            return;
        }

        const channel = await client.channels.fetch(jsonData.channelId);
        let message = await fetchMessage(jsonData, channel, jsonFilePath);

        const targetChannel = await client.channels.fetch(jsonData.channelReminder);

        const updateTasksMessage = async () => {
            try {
                const now = new Date();
                now.setMilliseconds(0);
                const startOfDay = new Date(now);
                startOfDay.setHours(0, 0, 0, 0);

                const tugasList = await Tugas.find({ tanggal: { $gte: startOfDay } })
                    .sort({ tanggal: 1, jam: 1 });

                const embed = createEmbed(now, tugasList, client, true);

                await message.edit({ embeds: [embed] });
            } catch (error) {
                log('Error updating tasks message: ' + error.message, 'error');
            }
        };

        await updateTasksMessage();
        setInterval(updateTasksMessage, 10000);

        const sendReminderToTargetChannel = async () => {
            try {
                const now = new Date();
                const startOfDay = new Date(now);
                startOfDay.setHours(0, 0, 0, 0);

                const tugasList = await Tugas.find({ tanggal: { $gte: startOfDay } })
                    .sort({ tanggal: 1, jam: 1 });

                const embed = createEmbed(now, tugasList, client, false);

                await targetChannel.send({ embeds: [embed] });
            } catch (error) {
                log('Error sending tasks reminder: ' + error.message, 'error');
            }
        };

        await sendReminderToTargetChannel();
        setInterval(sendReminderToTargetChannel, jsonData.jamReminder * 60 * 60 * 1000);
    }
};

const readOrInitializeJson = (filePath) => {
    if (!fs.existsSync(filePath)) {
        const defaultData = { channelId: null, messageId: null, channelReminder: null };
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }

    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        log('JSON file corrupted. Resetting to default.', 'warn');
        const defaultData = { channelId: null, messageId: null, channelReminder: null };
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
};

const fetchMessage = async (jsonData, channel, filePath) => {
    let message;

    if (jsonData.messageId) {
        try {
            message = await channel.messages.fetch(jsonData.messageId);
        } catch (error) {
            log('Failed to fetch previous message. Sending a new one.', 'warn');
            message = await sendNewMessage(channel);
            jsonData.messageId = message.id;
            fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
        }
    } else {
        message = await sendNewMessage(channel);
        jsonData.messageId = message.id;
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    }

    return message;
};

const sendNewMessage = (channel) => {
    return channel.send({
        embeds: [new EmbedBuilder().setDescription('📚 Loading tasks...').setColor('Random')]
    });
};

const createEmbed = (now, tugasList, client, includeLastUpdate = true) => {
    const timestamp = Date.now();
    const embed = new EmbedBuilder()
        .setTitle('📚 Daftar Tugas 📚')
        .setColor('Random')
        .setFooter({ text: `${process.env.GUILD_NAME}`, iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    if (includeLastUpdate) {
        embed.setDescription(`Last Update : **<t:${Math.round(timestamp / 1000)}:R>**\n\n`);
    }

    const validTasks = tugasList.filter((tugas) => {
        const [hour, minute] = tugas.jam.split(':').map(Number);
        const deadlineDate = new Date(tugas.tanggal);
        deadlineDate.setHours(hour, minute, 0, 0);
        return deadlineDate > now;
    });

    if (!Array.isArray(validTasks) || validTasks.length === 0) {
        embed.setDescription((embed.data.description || '') + "**Tidak Ada Tugas Untuk Saat Ini!**");
    } else {
        validTasks.forEach((tugas, index) => {
            const remainingTime = calculateRemainingTime(tugas);
            const tanggal = tugas.tanggal instanceof Date ? tugas.tanggal.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Invalid Date';
            const url = tugas.url ? tugas.url : '#';

            embed.addFields({
                name: `${index + 1}. ${tugas.tugas}`,
                value: `🗓️ **${tanggal} - ${tugas.jam}**\n⏳ **${remainingTime}**\n🔗 [Link Tugas](${url})`,
            });
        });
    }

    return embed;
};


const calculateRemainingTime = (tugas) => {
    const now = new Date();
    const [hour, minute] = tugas.jam.split(':').map(Number);
    const deadlineDate = new Date(tugas.tanggal);
    deadlineDate.setHours(hour, minute, 0, 0);

    const diff = deadlineDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${days} Hari ${hours} Jam ${minutes} Menit ${seconds} Detik`;
};

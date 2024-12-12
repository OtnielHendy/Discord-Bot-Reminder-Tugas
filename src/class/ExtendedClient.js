const { Client, Partials, Collection, GatewayIntentBits } = require("discord.js");
const config = require('../config');
const commands = require("../handlers/commands");
const events = require("../handlers/events");
const deploy = require("../handlers/deploy");
const components = require("../handlers/components");
const mongoose = require("../handlers/mongoose");
const Tugas = require('../models/tugasSchema');

module.exports = class extends Client {
    collection = {
        interactioncommands: new Collection(),
        prefixcommands: new Collection(),
        aliases: new Collection(),
        components: {
            buttons: new Collection(),
            selects: new Collection(),
            modals: new Collection()
        }
    };
    applicationcommandsArray = [];

    constructor() {
        super({
            intents: [Object.keys(GatewayIntentBits)],
            partials: [Object.keys(Partials)],
            presence: {
                activities: [{
                    name: 'Checking Tugas...',
                    type: 4,
                }],
                status: 'idle'
            }
        });
    };

    start = async () => {
        commands(this);
        events(this);
        components(this);

        if (config.handler.mongodb.toggle) mongoose();

        await this.login(process.env.CLIENT_TOKEN || config.client.token);

        if (config.handler.deploy) deploy(this, config);

        this.updatePresence();
    };

    updatePresence = async () => {
        const updateTaskCount = async () => {
            try {
                const now = new Date();
    
                const tugasList = await Tugas.find().lean();
                const activeTasks = tugasList.filter((tugas) => {
                    const [hour, minute] = tugas.jam.split(':').map(Number);
                    const taskDateTime = new Date(tugas.tanggal);
                    taskDateTime.setHours(hour, minute, 0, 0);
    
                    return taskDateTime > now;
                });
    
                const totalTugas = activeTasks.length;
    
                this.user.setPresence({
                    activities: [{
                        name: `${totalTugas === 0 ? 'Tidak Ada Tugas!' : `Ada ${totalTugas} Tugas!`}`,
                        type: 4,
                    }],
                    status: 'idle'
                });
            } catch (error) {
                console.error('Error updating presence:', error.message);
            }
        };
    
        setInterval(updateTaskCount, 10000);
    };       
}    

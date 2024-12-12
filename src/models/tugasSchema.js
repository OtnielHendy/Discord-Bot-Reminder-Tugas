const mongoose = require('mongoose')

const tugasSchema = mongoose.Schema({
    tanggal: {
        type: Date,
        required: [true, 'Tambahkan Tanggal!']
    },
    jam: {
        type: String,
        required: [true, 'Tambahkan Jam!']
    },
    tugas: {
        type: String,
        required: [true, 'Tambahkan Tugas!']
    },
    url: {
        type: String,
        required: [true, 'Tambahkan URL!']
    }
})

module.exports = mongoose.model('Tugas', tugasSchema)  
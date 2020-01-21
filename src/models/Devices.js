const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
    deviceId: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    time: String,
    state: {type: String, required: true},
    user: [
        {
            type: mongoose.Schema.Types.ObjectId,
            unique: true,
            ref:'User'
        }
    ],
    jobs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'job'//here
        }
    ]

});

module.exports = mongoose.model('Device', DeviceSchema);

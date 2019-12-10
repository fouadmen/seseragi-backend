const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
    deviceId: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    time: String,
    state: {type: String, required: true},
    owners: [
        {
            type: mongoose.Schema.Types.String,
            ref:'user'
        }
    ]

});

module.exports = mongoose.model('Device', DeviceSchema);

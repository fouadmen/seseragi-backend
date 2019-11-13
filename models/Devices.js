'use strict';
const mongoose = require('mongoose');
//TODO: adapt mongodb to use case
const connectionString = 'mongodb://localhost:27017/SeseragiDB';
mongoose.connect(connectionString,{useNewUrlParser: true, useUnifiedTopology:true})
    .then(()=>console.log('Connected to MongoDB'))
    .catch(()=>console.log('Cannot connect to MongoDB'));
//TODO : associate this device to its owen
const DeviceSchema = new mongoose.Schema({
    deviceId: String,
    name: String,
    time: String,
    state:String,
    owner: [
        {
            type: mongoose.Schema.Types.String,
            ref:'user'
        }
    ],
    measure:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'measure'
        }
    ]

});

module.exports = mongoose.model('Device', DeviceSchema);

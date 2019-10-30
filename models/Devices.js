'use strict';
const mongoose = require('mongoose');
//TODO: adapt mongodb to use case
mongoose.connect('mongodb://localhost:27017/SeseragiDB',{useNewUrlParser: true, useUnifiedTopology:true})
    .then(()=>console.log('Connected to MongoDB'))
    .catch(()=>console.log('Cannot connect to MongoDB'));
//TODO : associate this device to its owen
const DeviceSchema = new mongoose.Schema({
    deviceId: String,
    time: String,
    state:String,
    owner: String,
});

module.exports = mongoose.model('Device', DeviceSchema);
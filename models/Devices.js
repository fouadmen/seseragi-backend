'use strict';
const mongoose = require('mongoose');
//TODO: adapt mongodb to use case
const DEBUG = true;
const connectionString = DEBUG ? 'mongodb://localhost:27017/SeseragiDB' : 'mongodb://seseragiDb:B9nQT9iTAb@ds241408.mlab.com:41408/heroku_xbjkx44m';
mongoose.connect(connectionString,{useNewUrlParser: true, useUnifiedTopology:true})
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
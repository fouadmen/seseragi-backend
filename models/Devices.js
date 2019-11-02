'use strict';
const mongoose = require('mongoose');
//TODO: adapt mongodb to use case
const DEBUG = false;
const connectionString = DEBUG ? 'mongodb://localhost:27017/SeseragiDB' : 'mongodb://seseragi:L4u6yXNdzHxsRXww@ds241258.mlab.com:41258/heroku_bphq3jd9';
mongoose.connect(connectionString,{useNewUrlParser: true, useUnifiedTopology:true})
    .then(()=>console.log('Connected to MongoDB'))
    .catch(()=>console.log('Cannot connect to MongoDB'));
//TODO : associate this device to its owen
const DeviceSchema = new mongoose.Schema({
    deviceId: String,
    name: String,
    time: String,
    state:String,
    owner: String,
});

module.exports = mongoose.model('Device', DeviceSchema);
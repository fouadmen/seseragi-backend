'use strict';
const mongoose = require('mongoose');
//TODO: adapt mongodb to use case
const DEBUG = false;
const connectionString = DEBUG ? 'mongodb://localhost:27017/SeseragiDB' : 'mongodb://seseragi:L4u6yXNdzHxsRXww@ds241258.mlab.com:41258/heroku_bphq3jd9';
console.log(connectionString);
mongoose.connect(connectionString,{useNewUrlParser: true, useUnifiedTopology:true})
    .then(()=>console.log('Connected to MongoDB'))
    .catch(()=>console.log('Cannot connect to MongoDB'));
//TODO : associate this measure to its device
const MeasureSchema = new mongoose.Schema({
    client: String,
    type: String,
    value: String,
    time: String,
});

module.exports = mongoose.model('Measure', MeasureSchema);
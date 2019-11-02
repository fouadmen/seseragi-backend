'use strict';
const mongoose = require('mongoose');
//TODO: adapt mongodb to use case
const DEBUG = false;
const connectionString = DEBUG ? 'mongodb://localhost:27017/SeseragiDB' : 'mongodb://seseragi:L4u6yXNdzHxsRXww@ds241258.mlab.com:41258/heroku_bphq3jd9';
mongoose.connect(connectionString,{useNewUrlParser: true, useUnifiedTopology:true})
    .then(()=>console.log('Connected to MongoDB'))
    .catch(()=>console.log('Cannot connect to MongoDB'));

const UserSchema = new mongoose.Schema({
    userId: String,
    password: String,
    role: String,
});

module.exports = mongoose.model('User', UserSchema);
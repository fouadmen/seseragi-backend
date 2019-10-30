'use strict';
const mongoose = require('mongoose');
//TODO: adapt mongodb to use case
mongoose.connect('mongodb://localhost:27017/SeseragiDB',{useNewUrlParser: true, useUnifiedTopology:true})
    .then(()=>console.log('Connected to MongoDB'))
    .catch(()=>console.log('Cannot connect to MongoDB'));

const UserSchema = new mongoose.Schema({
    user: String,
    password: String,
    role: String,
});

module.exports = mongoose.model('User', UserSchema);
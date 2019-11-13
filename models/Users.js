'use strict';
const mongoose = require('mongoose');
//TODO: adapt mongodb to use case
const connectionString = 'mongodb://localhost:27017/SeseragiDB';
mongoose.connect(connectionString,{useNewUrlParser: true, useUnifiedTopology:true})
    .then(()=>console.log('Connected to MongoDB'))
    .catch(()=>console.log('Cannot connect to MongoDB'));

const UserSchema = new mongoose.Schema({
    userId: String,
    password: String,
    role: String,
    device: [
        {
            type: mongoose.Schema.Types.String,
            ref: 'device'
        }
    ]
});

module.exports = mongoose.model('User', UserSchema);

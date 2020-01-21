const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: {type: String, required: true, unique: true},
    password: String,
    thumbnail: String,
    name: {type: String, required: true},
    role: {type: String, required: true},
    device: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Device'
        }
    ]
});

module.exports = mongoose.model('User', UserSchema);

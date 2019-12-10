const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
const UserSchema = new mongoose.Schema({
    userId: {type: String, required: true, unique: true},
    password: String,
    thumbnail: String,
    name: String,
    role: String,
    device: [
        {
            type: mongoose.Schema.Types.String,
            ref: 'device'
        }
    ]
});

module.exports = mongoose.model('User', UserSchema);

const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    jobId: {type: String, required: true, unique: true},
    command: {type: String, required: true},
    deviceId: {type: String, required: true},
    from: {type: String, required: true},
    to: {type: String, required: true},
    active : {type: String, required: true}
});

module.exports = mongoose.model('Job', JobSchema);

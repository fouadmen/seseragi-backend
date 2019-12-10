const mongoose = require('mongoose');
const MeasureSchema = new mongoose.Schema({
    client: {type: String, required: true},
    type: {type: String, required: true},
    value: {type: String, required: true},
    time: {type: String, required: true},
});

module.exports = mongoose.model('Measure', MeasureSchema);

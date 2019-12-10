const express  =  require('express');
const users =  require('./routes/users');
const measures = require('./routes/measures');
const devices = require('./routes/devices');

module.exports = ()=>{
    const app = express.Router();
    users(app);
    measures(app);
    devices(app);

    return app;
};

const express  =  require('express');
const users =  require('./routes/users');
const auth = require('./routes/auth');
const measures = require('./routes/measures');
const devices = require('./routes/devices');
const jobs = require('./routes/jobs');

module.exports = (passport)=>{
    const app = express.Router();
    users(app, passport);
    auth(app);
    measures(app, passport);
    devices(app, passport);
    jobs(app, passport);
    return app;
};

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Measure = require("./models/Measure");
const Device = require("./models/Devices");
const User = require("./models/Users");
app.use(bodyParser.json());

app.get('/', (req,res)=>{
    console.log('in the index');
    res.send("Index route");
});

/*--------------------------- Measures routes ------------------------------------ */
//TODO: needs privilege to get in here
app.get('/measures', (req,res)=>{
    Measure.find((err, measures)=>{
        if(err){
            console.log(err);
        }else{
            res.send(measures);
        }
    }).sort({time:-1});
});

app.post('/measures', (req, res)=>{
    //TODO: only devices can known origin devices can insert
    const _measure = new Measure(req.body);
    _measure.save((err)=>{
        if(err){
            console.log('Problem while inserting the new measure');
            res.send(false);
        } else {
            res.send(true);
        }
    });
});

app.get('/measures/:deviceId', (req,res)=>{
    const _deviceId = req.params.deviceId;

    Measure.find({client : _deviceId}, (err, measures)=>{
        if(err){
            console.log(err);
        }else{
            res.send(measures);
        }
    }).sort({time:-1});
});

app.get('/measures/:deviceId/:dataType', (req,res)=>{
    const _dataType = req.params.dataType.toLowerCase();
    const _deviceId = req.params.deviceId;
    const _period = req.query;
    console.log('trying to get measures data for : ', _deviceId, _dataType, typeof _period);
    if(typeof _period === 'object' && Object.entries(_period).length===0){
        Measure.find({client : _deviceId, type : _dataType}, (err, measures)=>{
            if(err){
                console.log(err);
            }else{
                res.send(measures);
            }
        }).sort({time:-1}).limit(1440);
    }else if(_period.hasOwnProperty('from') && _period.hasOwnProperty('to')){
        Measure.find({client : _deviceId, type : _dataType, time : {$gte: _period['from'], $lt: _period['to']}}, (err, measures)=>{
            if(err){
                console.log(err);
            }else{
                res.send(measures);
            }
        }).sort({time:-1});
    } else if (_period.hasOwnProperty('from')){
        Measure.find({client : _deviceId, type : _dataType, time : {$gte: _period['from']}}, (err, measures)=>{
            if(err){
                console.log(err);
            }else{
                res.send(measures);
            }
        }).sort({time:-1});
    } else if (_period.hasOwnProperty('to')){
        Measure.find({client : _deviceId, type : _dataType, time : {$lt: _period['to']}}, (err, measures)=>{
            if(err){
                console.log(err);
            }else{
                res.send(measures);
            }
        }).sort({time:-1});
    } else {
        //TODO: respond with proper code
        res.send(false);
    }

});

/*--------------------------- Devices routes ------------------------------------- */

app.get('/devices/:owner',(req, res)=>{
    const _owner = req.params.owner;
    Device.find({owner : _owner},(err, devices)=>{
        if(err){
            console.log('Error in devices route : ', err.message);
            res.send(false);
        }else{
            let _devices = [];
            devices.forEach((device)=>{
                _devices.push(device.deviceId);
            });

            res.send(_devices);
        }
    });
});

app.post('/devices',(req, res)=>{
    const _device = new Device(req.body);
    console.log('posting new devices', _device);
    Device.create(_device,(err)=>{
        if(err){
            console.log('Error in devices route : ', err.message);
            res.send(false);
        }else{
            res.send(true);
        }
    });
});

/*-------------------------------------------------------------------------------- */
/*--------------------------- Auth routes ---------------------------------------- */

app.post('/users',(req, res)=>{
    console.log(req.body.userId);
    User.find({userId : req.body.userId},(err, user)=>{
        if(err){
            console.error('Error while searching for user');
            res.send(false);
            return;
        }else{
            if(user.length===0){
                console.log('user is not found', user);
                const _user = new User(req.body);
                User.create(_user,(err)=>{
                    if(err){
                        console.error('Error while creating new user');
                        res.send(false);
                        return;
                    }
                    return;
                });
            }
            res.send(true);
            return;
        }
    });
});

app.get('/users',(req, res)=>{
    res.send('res');
    console.log('here')
});


/*-------------------------------------------------------------------------------- */
module.exports = app;


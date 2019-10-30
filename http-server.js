const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Measure = require("./models/Measure");
const Device = require("./models/Devices");

app.use(bodyParser.json());

app.get('/', (req,res)=>{
    console.log('in the index');

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
    Measure.find({client : _deviceId, type : _dataType}, (err, measures)=>{
        if(err){
            console.log(err);
        }else{
            res.send(measures);
        }
    }).sort({time:-1});
});



/*-------------------------------------------------------------------------------- */

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



/*-------------------------------------------------------------------------------- */
module.exports = app;


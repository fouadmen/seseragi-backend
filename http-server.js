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
app.post('/measures', (req, res)=>{
    //TODO: only known origin devices can insert
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
    if(typeof _period === 'object'){
        let query = {client : _deviceId, type : _dataType};
        const projection = {"_id":0, "value" : 1 , "time" : 1};
        if(Object.keys(_period).length!==0){
            if(_period.hasOwnProperty('from') && _period.hasOwnProperty('to')){
                query.time= {$gte: _period['from'], $lt: _period['to']};
            } else if (_period.hasOwnProperty('from')){
                query.time= {$gte: _period['from']};
            } else {
                query.time= {$lt: _period['to']};
            }
        }
        Measure.find(query, projection, (err, measures)=>{
            if(err){
                console.log(err);
            }else{
                res.send(measures);
            }
        }).sort({time:-1}).limit(1440);
    }else {
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
                _devices.push({deviceId:device.deviceId, isConnected: device.state === 'connected', name : device.name});
            });
            res.send(_devices);
        }
    });
});

app.post('/devices',(req, res)=>{
    Device.findOne({"deviceId" : req.body.deviceId},(err, device)=>{
       if(err){
           res.send(false);
       }else{
           if(!device){
               let {owner, ...data} = req.body;
               User.findOne({"userId": owner},(err, user)=>{
                   if(err){
                       console.log(err);
                       res.send(false);//User does not exist yet
                   }else{
                       const _device = new Device(data);
                       Device.create(_device,(err, device)=>{
                           if(err){
                               console.log('Error in devices route while creating new document : ', err.message);
                               res.send(false);
                           }else{
                               device.owner.push(user.userId);
                               device.save();
                               user.device.push(device.deviceId);
                               user.save();
                               res.send(true);
                           }
                       });
                   }
               });
           }else{
               console.warn('device already exists');
               res.send(false);
           }
       }
    });
});

app.put('/devices/:id',(req, res)=>{
    const deviceId = req.params.id;
    const device = req.body;
    Device.findOneAndUpdate({"deviceId" : deviceId}, {$set: device}, {useFindAndModify:false, new:true}, (err, device)=>{
       if(err){
           res.send(false);
       } else {
           console.log(device);
           res.send(true);
       }
    });
});

app.delete('/devices/:id',(req, res)=>{
    const deviceId = req.params.id;
    Device.findOneAndRemove({"deviceId" : deviceId},{useFindAndModify:false}, (err)=>{
        if(err){
            res.send(false);
        }else{
            res.send(true);
        }
    });
});

/*-------------------------------------------------------------------------------- */
/*--------------------------- Auth routes ---------------------------------------- */

app.get('/users',(req, res)=>{
    User.find({}, (err, users)=>{
        if(err){
            res.send(false);
        } else {
            res.send(users);
        }
    });
});

app.post('/users',(req, res)=>{
    console.log(req.body.userId);
    User.find({userId : req.body.userId},(err, user)=>{
        if(err){
            console.error('Error while searching for user');
            res.send(false);
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
                });
            }
            res.send(true);
        }
    });
});

app.put('/users/:id',(req, res)=>{
    const userId = req.params.id;
    const user = req.body;
    console.log(userId);
    console.log(user);
    Device.findOneAndUpdate({"userId" : userId}, {$set: user}, {useFindAndModify:false}, (err, device)=>{
        if(err){
            res.send(false);
        } else {
            console.log(device);
            res.send(true);
        }
    });
});

app.delete('/users/:id',(req, res)=>{
    const userId = req.params.id;
    Device.findOneAndRemove({"userId" : userId},{useFindAndModify:false}, (err)=>{
        if(err){
            res.send(false);
        }else{
            res.send(true);
        }
    });
});





/*-------------------------------------------------------------------------------- */
module.exports = app;


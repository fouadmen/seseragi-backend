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
        const projection = {"_id":0, "value" : 1 , "time" : 1, "type": 1};
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
    Device.find({ owners: { $all: [_owner] } }, async (err, devices)=>{
        if(err){
            console.log('Error in devices route : ', err.message);
            res.send(false);
        }else{
            let _devices = [];
            let promises = [];
            for (let i =0; i<devices.length; i++){
                promises.push(new Promise((resolve, reject)=>{
                    let tmpDevice = {
                        deviceId:devices[i].deviceId,
                        isConnected: devices[i].state === 'connected',
                        name : devices[i].name,
                        owners: ''
                    };
                    User.find({userId : {$in : devices[i].owners}},{"_id":0, "userId" : 1 , "role" : 1, "thumbnail" : 1, "name": 1, "device":1},(err, owners)=>{
                        if(err || !owners){
                            console.error(err);
                            reject(err ? err : 'No owner');
                        }else{
                            tmpDevice.owners = owners;
                            _devices.push(tmpDevice);
                            resolve(_devices);
                        }
                    });
                }))
            }

            await Promise.all(promises).then(()=>{
                res.send(_devices);
            }).catch((error)=>{
                console.error(error);
                res.send(error);
            });

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
                   if(err || !user){
                       console.log(err ? err : 'Unknown user');
                       res.send(err ? err : 'Unknown user');
                   }else{
                       const _device = new Device(data);
                       Device.create(_device,(err, device)=>{
                           if(err){
                               console.log('Error in devices route while creating new document : ', err.message);
                               res.send(false);
                           }else{
                               device.owners.push(user.userId);
                               user.device.push(device.deviceId);
                               Promise.all([device.save(),  user.save()]).then(()=>{
                                   res.send(device);
                               }).catch((err)=>{
                                  console.error(err);
                                  res.send(false);
                               });
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
    const query = req.body;
    console.warn('Device PUT', query, deviceId);
    Device.findOneAndUpdate({"deviceId" : deviceId}, {$set: query}, {useFindAndModify:false, new:true}, (err, device)=>{
       if(err){
           console.error(err);
           res.send(false);
       } else {
           if(query.hasOwnProperty('owners')){
               console.log(device.deviceId);
               User.findOneAndUpdate({userId : {$nin : device.owners}, device:{$all : [device.deviceId]}},{$pull : {device : device.deviceId}},{useFindAndModify:false},(err, user)=>{
                   if(err){
                       res.send(false);
                       console.error(err);
                   }else{
                       let tmpDevice = {
                           deviceId:device.deviceId,
                           isConnected: device.state === 'connected',
                           name : device.name,
                           owners: ''
                       };

                       User.find({userId : {$in : device.owners}},{"_id":0, "userId" : 1 , "role" : 1, "thumbnail" : 1, "name": 1},(err, owners)=>{
                           if(err || !owners){
                               res.send(false);
                               console.error(err);
                           }else{
                               tmpDevice.owners = owners;
                               res.send([tmpDevice]);
                           }
                       });
                   }
               })
           }else{
               let tmpDevice = {
                   deviceId:device.deviceId,
                   isConnected: device.state === 'connected',
                   name : device.name,
                   owners: ''
               };

               User.find({userId : {$in : device.owners}},{"_id":0, "userId" : 1 , "role" : 1, "thumbnail" : 1, "name": 1},(err, owners)=>{
                   if(err || !owners){
                       res.send(false);
                       console.error(err);
                   }else{
                       tmpDevice.owners = owners;
                       res.send([tmpDevice]);
                   }
               });
           }
       }
    });
});

app.delete('/devices/:id',(req, res)=>{
    const deviceId = req.params.id;
    Device.findOneAndRemove({"deviceId" : deviceId},{useFindAndModify:false}, (err, device)=>{
        if(err || !device){
            res.send(false);
        }else{
            device.owners.forEach((userId)=>{
               User.findOne({"userId" : userId}, (err, user)=>{
                   if(!user){
                       console.error(err);
                   }else{
                       user.device.pop(device.deviceId);
                   }
               });
            });
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
                    }else{
                        res.send(true);
                    }
                });
            }else{
                res.send(true);
            }

        }
    });
});

app.put('/users/:id',(req, res)=>{
    const userId = req.params.id;
    const user = req.body;
    console.log(userId);
    console.log(user);
    const query = req.body.hasOwnProperty("devices");
    if(query){
        console.log(true);
        console.log(req.body.devices);
        User.findOne({"userId" : userId}, {useFindAndModify:false}, (err, user)=>{
            if(err || !user){
                console.error(err);
                res.send(err ? err : 'This user does not exit');
                return;
            } else {
                Device.find({deviceId:{$in : req.body.devices}},(err, devices)=>{
                    if(err || !devices){
                        console.error(err);
                        res.send(false);
                    }else{
                        devices.forEach((device)=>{
                            console.log('--------');
                            console.log(device.owners.includes(user.userId) );
                            console.log(user.device.includes(device.deviceId));
                            console.log('--------');
                            if(!device.owners.includes(user.userId) && !user.device.includes(device.deviceId)){
                                device.owners.push(user.userId);
                                user.device.push(device.deviceId);
                                device.save().catch((err)=>{
                                    console.error(err);
                                    res.send(err);
                                    return;
                                });
                            }
                        });
                        user.save().then(()=>res.send(true));
                    }
                });
            }
        });
    }else{
        User.findOneAndUpdate({"userId" : userId},{$set : req.body}, {useFindAndModify:false}, (err, user)=>{
            if(err){
                res.send(false);
            } else {
                console.log(user);
                res.send(true);
            }
        });
    }
});

app.delete('/users/:id',(req, res)=>{
    const userId = req.params.id;
    User.findOneAndRemove({"userId" : userId},{useFindAndModify:false}, (err, user)=>{
        if(err){
            res.send(false);
        }else{
            Device.find({owners:{$all : [user.userId]}},(err, devices)=>{
                if(err || !devices){
                    console.error(err);
                    res.send(false);
                }else{
                    devices.forEach((device)=>{
                        device.owners.pop(user.userId);
                        device.save().catch((err)=>{
                            console.error(err);
                            res.send(false);
                            return;
                        });
                    });
                    res.send(true);
                }
            });
        }
    });
});

/*-------------------------------------------------------------------------------- */
module.exports = app;


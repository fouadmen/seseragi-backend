const User = require('../models/Users');
const Device = require('../models/Devices');

module.exports = {
    getDevices : (owner)=>{
        return Device.find({ owners: { $all: [owner] } }).then((devices)=>{
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

            return  Promise.all(promises).then(()=>{
                return _devices;
            }).catch((error)=>{
                console.error(error);
                return false;
            });
        }).catch((err)=>{
            console.error('Error in devices route : ', err.message);
            return false;
        })
    },
    createDevice : (newDevice)=>{
        return Device.findOne({"deviceId" : newDevice.deviceId}).then((device)=>{
            if(!device){
                let {owner, ...data} = newDevice;
                return User.findOne({"userId": owner}).then((user)=>{
                    if(!user){
                        console.warn( 'Unknown user');
                        return false;
                    }else{
                        const _device = new Device(data);
                        return new Promise(((resolve, reject) => {
                            Device.create(_device,(err, device)=>{
                                if(err){
                                    reject(err);
                                }else{
                                    device.owners.push(user.userId);
                                    user.device.push(device.deviceId);
                                    return Promise.all([device.save(),  user.save()]).then(()=>{
                                        resolve(device);
                                    }).catch((err)=>{
                                        reject(err);
                                    });
                                }
                            });
                        })).then(()=>{
                            return true;
                        }).catch((err)=>{
                            console.error(err);
                            return false;
                        });
                    }
                }).catch((err)=>{
                    console.error(err);
                    return false;
                });
            }else{
                console.warn('device already exists');
                return false;
            }
        }).catch((err)=>{
            console.error(err);
            return err;
        })
    },
    editDevice : (deviceId, query)=>{
        return Device.findOneAndUpdate({"deviceId" : deviceId}, {$set: query}).then((device)=>{
            if(device){
                let _device = {
                    deviceId:device.deviceId,
                    isConnected: device.state === 'connected',
                    name : device.name,
                    owners: ''
                };
                if(query.hasOwnProperty('owners')){
                    return User.findOneAndUpdate({userId : {$nin : device.owners}, device:{$all : [device.deviceId]}},{$pull : {device : device.deviceId}})
                        .then(()=>{
                            return User.find({userId : {$in : device.owners}},{"_id":0, "userId" : 1 , "role" : 1, "thumbnail" : 1, "name": 1})
                                .then((owners)=>{
                                    _device.owners = owners;
                                    return [_device];
                                })
                                .catch((err)=>{
                                    console.error(err);
                                    return false;
                                })
                        }).catch((err)=>{
                            console.error(err);
                            return false;
                        })
                }else{
                    return User.find({userId : {$in : device.owners}})
                        .then((owners)=>{
                            _device.owners = owners;
                            return [_device];
                        })
                        .catch((err)=>{
                            console.error(err);
                            return false;
                        })
                }
            }else{
                console.warn('Unknown device');
                return false;
            }
        }).catch((err)=>{
            console.error(err);
            return false;
        })

    },
    deleteDevice: (deviceId)=>{
        return Device.findOneAndRemove({"deviceId" : deviceId}).then((device)=>{
            if(device){
                if(device.owners){
                    device.owners.forEach((userId)=>{
                        return User.findOne({"userId" : userId})
                            .then((user)=>{
                                if(!user)
                                    user.device.pop(device.deviceId);
                            })
                    });
                }
                return true;
            }else{
                console.warn('Unknown device');
                return false;
            }
        }).catch((err)=>{
            console.error(err);
            return false;
        })
    }
};


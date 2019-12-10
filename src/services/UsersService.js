const User = require('../models/Users');
const Device = require('../models/Devices');

module.exports = {
    signIn : (newUser)=>{
        const _user = new User(newUser);
        const promise = new Promise(((resolve, reject) => {
            User.create(_user,(err, user)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(user);
                }
            })
        }));

        return promise.then((res)=>{
            return true;
        }).catch((err)=>{
            if(err.code === 11000){
                console.warn(err.errmsg);
                return true;
            }
            else{
                console.error(err);
                return false;
            }

        })
    },

    editUser : (userId, body)=>{
        const query = body.hasOwnProperty("devices");
        if(query){
           return User.findOne({"userId" : userId})
               .then((user)=>{
                    if(!user){
                        console.warn('This user does not exist');
                        return false;
                    }else{
                        console.log(body.devices);
                        return Device.find({deviceId:{$in : body.devices}}).then((devices)=>{
                            if(devices.length>0){
                                devices.forEach((device)=>{
                                    if(!device.owners.includes(user.userId) && !user.device.includes(device.deviceId)){
                                        device.owners.push(user.userId);
                                        user.device.push(device.deviceId);
                                        return device.save().then(()=>{
                                            return true;
                                        }).catch((err)=>{
                                            console.error(err);
                                            return false;
                                        });
                                    }
                                });
                                return user.save().then(()=>{
                                    return true;
                                });
                            }else{
                                console.warn('This device does not exist');
                                return false;
                            }
                        }).catch((err)=>{
                            console.error(err);
                            return false;
                        })
                    }
                })
               .catch((err)=>
                {
                    console.error(err);
                    return false;
                })
        }else{
            return User.findOneAndUpdate({"userId" : userId},{$set : body})
                .then((user)=>{
                    console.log(user);
                    return true;
                }).catch((err)=>{
                    console.error(err);
                    return false;
                });
        }
    },
    deleteUser: (userId)=>{
        return User.findOneAndRemove({"userId" : userId}).then((user)=>{
            return Device.find({owners:{$all : [user.userId]}}).then((devices)=>{
                if(devices){
                    devices.forEach((device)=>{
                        device.owners.pop(user.userId);
                        device.save().catch((err)=>{
                            console.error(err);
                            return false;
                        });
                    });
                    return true;
                }
            }).catch((err)=>{
                console.error(err);
                return false
            })
        }).catch((err)=>{
            console.error(err);
            return false;
        });
    }
};

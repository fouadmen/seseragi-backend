const User = require('../models/Users');
const Device = require('../models/Devices');

module.exports = {
    getDevices: (query) => {
        return Device.find({"user": {$all: [query.owner]}})
            .populate('user', 'userId name device thumbnail role')
            .populate('jobs')
            .exec()
            .then(devices => {
                return devices
            })
            .catch(err => {
                if (err) {
                    console.error(err);
                    return false;
                }
            })
    },

    getDeviceById: (id) => {
        return Device.findOne({"deviceId": id})
            .populate('user', 'userId name device thumbnail role')
            .populate('jobs')
            .exec()
            .then(device => {
                return device
            })
            .catch(err => {
                if (err) {
                    console.error(err);
                    return false;
                }
            })
    },
    createDevice: (newDevice) => {
        const creationPromise = new Promise((resolve, reject) => {
            Device.findOne({"deviceId": newDevice.deviceId},(err, device) => {
                if (!device) {
                    User.findOne({"userId": newDevice.owner},async (err, user) => {
                        if(err) {
                            return reject({code:502, err: err});
                        }
                        else if (!user) {
                            return reject({code:400, err: 'Unknown user'});
                        } else {
                            const _device = new Device(newDevice);
                            _device.user.push(user._id);
                            await _device.save(async (err) => {
                                if (err)
                                    return reject({code:502, err: err});
                                user.device.push(_device._id);
                                await user.save((err) => {
                                    if (err)
                                        return reject({code:502, err: err});
                                });
                                return resolve(_device);
                            });
                        }
                    })
                } else {
                    return reject({code:400, err: 'Device already exists'});
                }
            })
        });

        return creationPromise.then(device => {
            return {success: true, device:device}
        }).catch(err => {
            return {success: false, err: err}
        });
    },
    editDevice: (deviceId, query) => {
        if (query.hasOwnProperty('owners')) {
            return Device.findOneAndUpdate({"deviceId": deviceId}, {$set: {user: query.owners}}, {new: true})
                .populate('user', 'userId name device thumbnail role')
                .populate('jobs')
                .then(async device => {
                    await User.update({
                        _id: {$in: query.owners},
                        device: {$not: {$all: [device._id]}}
                    }, {$push: {device: device._id}});
                    await User.update({
                        _id: {$nin: query.owners},
                        device: {$all: [device._id]}
                    }, {$pull: {device: device._id}});
                    return device;
                }).catch((err) => {
                    console.error(err);
                    return false;
                });
        } else {
            return Device.findOneAndUpdate({"deviceId": deviceId}, {$set: query}, {new: true})
                .populate('user', 'userId name device thumbnail role')
                .populate('jobs')
                .exec()
                .then((devices) => {
                    return devices
                })
                .catch((err) => {
                    console.error(err);
                    return false;
                });
        }
    },
    deleteDevice: (deviceId) => {
        return Device.findOneAndRemove({"deviceId": deviceId})
            .then((device) => {
                if (device) {
                    if (device.user) {
                        return User.find({"_id": {$all: device.user}})
                            .then((users) => {
                                users.forEach((user) => {
                                    user.device.pop(device._id);
                                    user.save();
                                });
                                return true;
                            })
                    }
                    return true;
                } else {
                    console.warn('Unknown device');
                    return false;
                }
            }).catch((err) => {
                console.error(err);
                return false;
            })
    }
};


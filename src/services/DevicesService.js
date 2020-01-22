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
        return Device.findOne({"deviceId" : id})
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
        return Device.findOne({"deviceId": newDevice.deviceId}).then((device) => {
            if (!device) {
                return User.findOne({"userId": newDevice.owner})
                    .then((user) => {
                        if (!user) {
                            console.warn('Unknown user');
                            return false;
                        } else {
                            const _device = new Device(newDevice);
                            _device.user.push(user._id);
                            _device.save((err) => {
                                if (err) {
                                    console.log(err);
                                    return false;
                                }
                                user.device.push(_device._id);
                                user.save((err) => {
                                    if (err) {
                                        console.error(err);
                                        return false;
                                    }
                                })
                            });

                            return _device;
                        }
                    })
            } else {
                console.warn('device already exists');
                return false;
            }
        }).catch((err) => {
            console.error(err);
            return false;
        })
    },
    editDevice: (deviceId, query) => {
        if (query.hasOwnProperty('owners')) {
            return Device.findOneAndUpdate({"deviceId": deviceId}, {$set: {user: query.owners}}, {new: true})
                .populate('user', 'userId name device thumbnail role')
                .populate('jobs')
                .then(async device => {
                    await User.update({_id: {$in: query.owners}, device: {$not : {$all: [device._id]}}}, {$push: {device: device._id}});
                    await User.update({_id: {$nin: query.owners}, device: {$all: [device._id]}}, {$pull: {device: device._id}});
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


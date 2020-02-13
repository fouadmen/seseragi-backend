const express = require('express');
const router = express.Router();
const DeviceController = require('../../controllers/DevicesController');

module.exports = (app, passport)=>{
    app.use('/devices', router);

    router.get('/',passport.authenticate('jwt', {session:false}),DeviceController.getDevices);

    router.get('/:id',passport.authenticate('jwt', {session:false}),DeviceController.getDeviceById);

    router.post('/',DeviceController.addNewDevice); // TODO: only devices can post to this route, with their default token

    router.put('/:id',passport.authenticate('jwt', {session:false}),DeviceController.modifyDevice);

    router.delete('/:id',passport.authenticate('jwt', {session:false}),DeviceController.deleteDevice);

};

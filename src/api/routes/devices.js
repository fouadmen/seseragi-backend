const express = require('express');
const router = express.Router();
const DeviceController = require('../../controllers/DevicesController');

module.exports = (app)=>{
    app.use('/devices', router);

    router.get('/',DeviceController.getDevices);

    router.get('/:id',DeviceController.getDeviceById);

    router.post('/',DeviceController.addNewDevice);

    router.put('/:id',DeviceController.modifyDevice);

    router.delete('/:id',DeviceController.deleteDevice);

};

const express = require('express');
const router = express.Router();
const DeviceController = require('../../controllers/DevicesController');

module.exports = (app)=>{
    app.use('/devices', router);

    router.get('/:owner',DeviceController.getDevices);

    router.post('/',DeviceController.addNewDevice);

    router.put('/:id',DeviceController.modifyDevice);

    router.delete('/:id',DeviceController.deleteDevice);

};

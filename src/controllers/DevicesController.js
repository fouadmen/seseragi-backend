const DevicesService = require('../services/DevicesService');
// @TODO : Create Logger
module.exports = {
    getDevices : async (req, res)=>{
        const query = req.query;
        const state = await DevicesService.getDevices(query);
        if(state){
            res.status(200).send(state);
        }else{
            res.status(520).send(state);
        }
    },

    getDeviceById : async (req, res)=>{
        const id = req.params.id;
        const state = await DevicesService.getDeviceById(id);
        if(state){
            res.status(200).send(state);
        }else{
            res.status(520).send(state);
        }
    },

    addNewDevice : async (req, res) => {
        const state = await DevicesService.createDevice(req.body);
        if(state){
            res.status(201).send(state);
        }else{
            res.status(520).send(false);
        }
    },

    modifyDevice : async (req, res) => {
        const newDevice = await DevicesService.editDevice(req.params.id, req.body);
        if(newDevice){
            res.status(200).send(newDevice);
        }else{
            res.status(520).send(false);
        }
    },

    deleteDevice : async (req, res) => {
        const state = await DevicesService.deleteDevice(req.params.id);
        if(state){
            res.status(202).send(true);
        }else{
            res.status(520).send(false);
        }
    }
};

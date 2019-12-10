const User = require('../models/Users');
const Device = require('../models/Devices');
const UsersService = require('../services/UsersService');
// @TODO : Create Logger
module.exports = {
    getAllUsers : (req, res)=>{
        User.find({}, (err, users)=>{
            if(err){
                res.status(204).send(err);
            } else {
                res.status(200).send(users);
            }
        });
    },

    addNewUser : async (req, res) => {
        const state = await UsersService.signIn(req.body);
        if(state){
            res.status(200).send(state);
        }else{
            res.status(520).send(state);
        }
    },

    modifyUser : async (req, res) => {
        const state = await UsersService.editUser(req.params.id, req.body);
        if(state){
            res.status(200).send(state);
        }else{
            res.status(520).send(state);
        }
    },

    deleteUser : async (req, res) => {
        const state = await UsersService.deleteUser(req.params.id);
        if(state){
            res.status(200).send(state);
        }else{
            res.status(520).send(state);
        }
    }
};

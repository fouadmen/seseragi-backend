const UsersService = require('../services/UsersService');
// @TODO : Create Logger
module.exports = {
    getAllUsers : async (req, res)=>{
        const state = await UsersService.getAllUsers();
        if(state){
            res.status(200).send(state);
        }else{
            res.status(520).send(state);
        }
    },

    getUserById : async (req, res)=>{
        const state = await UsersService.getUserById(req.params.id);
        if(state){
            res.status(200).send(state);
        }else{
            res.status(520).send(state);
        }
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
            res.status(520).send(false);
        }
    },

    deleteUser : async (req, res) => {
        const state = await UsersService.deleteUser(req.params.id);
        if(state){
            res.status(204).send(state);
        }else{
            res.status(520).send(state);
        }
    }
};

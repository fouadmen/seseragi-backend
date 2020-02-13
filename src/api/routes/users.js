const express  =  require('express');
const UsersController = require('../../controllers/UsersController');
const router = express.Router();

module.exports = (app, passport)=>{
    app.use('/users', router);

    router.get('/', passport.authenticate('jwt', {session:false}),UsersController.getAllUsers);

    router.get('/:id', passport.authenticate('jwt', {session:false}),UsersController.getUserById);

    router.put('/:id',passport.authenticate('jwt', {session:false}),UsersController.modifyUser);

    router.delete('/:id',passport.authenticate('jwt', {session:false}),UsersController.deleteUser);
};

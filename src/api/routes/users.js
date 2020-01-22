const express  =  require('express');
const UsersController = require('../../controllers/UsersController');
const router = express.Router();

module.exports = (app)=>{
    app.use('/users', router);

    router.get('/', UsersController.getAllUsers);

    router.get('/:id', UsersController.getUserById);

    router.post('/',UsersController.authenticateUser);

    router.put('/:id',UsersController.modifyUser);

    router.delete('/:id',UsersController.deleteUser);
};

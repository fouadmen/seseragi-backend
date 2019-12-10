const express  =  require('express');
const UsersController = require('../../controllers/UsersController');
const router = express.Router();

module.exports = (app)=>{
    app.use('/users', router);

    router.get('/', UsersController.getAllUsers);

    router.post('/',UsersController.addNewUser);

    router.put('/:id',UsersController.modifyUser);

    router.delete('/:id',UsersController.deleteUser);
};

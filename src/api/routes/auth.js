const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/AuthController');

module.exports = (app)=>{
    app.use('/', router);

    router.post('/register',AuthController.register);

    router.post('/login',AuthController.login);

    //router.post('/logout',AuthService.logout);
    //Whoever took this later, do some clever stuff here if you can, good luck ;)

};

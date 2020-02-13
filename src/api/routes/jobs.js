const express = require('express');
const router = express.Router();
const JobController = require('../../controllers/JobsController');

module.exports = (app,passport)=>{
    app.use('/jobs', router);

    router.get('/:jobId',passport.authenticate('jwt', {session:false}),JobController.getDeviceJobs);

    router.post('/',passport.authenticate('jwt', {session:false}),JobController.addJob);

    router.put('/:id',passport.authenticate('jwt', {session:false}),JobController.modifyJob);

    router.delete('/:id',passport.authenticate('jwt', {session:false}),JobController.deleteJob);

};

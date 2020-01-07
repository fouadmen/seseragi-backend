const express = require('express');
const router = express.Router();
const JobController = require('../../controllers/JobsController');

module.exports = (app)=>{
    app.use('/jobs', router);

    router.get('/:jobId',JobController.getDeviceJobs);

    router.post('/',JobController.addJob);

    router.put('/:id',JobController.modifyJob);

    router.delete('/:id',JobController.deleteJob);

};

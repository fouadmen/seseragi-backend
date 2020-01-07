const JobsService = require('../services/JobsService');

module.exports = {
    getDeviceJobs : async (req, res)=>{
        const state = await JobsService.getDeviceJobs(req.params.jobId);
        if(state){
            res.status(200).send(state);
        }else{
            res.status(520).send(state);
        }
    },
    addJob : async (req, res) => {
        const state = await JobsService.createJob(req.body);
        if(state){
            res.status(201).send(state);
        }else{
            res.status(520).send(false);
        }
    },

    modifyJob : async (req, res) => {
        const newJob = await JobsService.editJob(req.params.id, req.body);
        if(newJob){
            res.status(200).send(newJob);
        }else{
            res.status(520).send(false);
        }
    },

    deleteJob : async (req, res) => {
        const state = await JobsService.deleteJob(req.params.id);
        if(state){
            res.status(200).send(state);
        }else{
            res.status(520).send(false);
        }
    }
};

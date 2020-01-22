const Job = require('../models/Jobs');
const Device = require('../models/Devices');
const mScheduler =  require('../decorators/MyScheduler');

module.exports = {
    getDeviceJobs : (jobId)=>{
        return Job.find({ jobId: jobId }).then((jobs)=>{
            return jobs;
        }).catch((err)=>{
            console.error('Error in jobs route : ', err.message);
            return false;
        })
    },
    createJob : (job)=>{
        const newJob = new Job(job);
        return Job.create(newJob)
            .then((_job)=>{
                return Device.findOneAndUpdate({"deviceId" : _job.deviceId},{$push : {jobs : _job._id}}, {new : true})
                    .populate('jobs')
                    .populate('user','userId name device thumbnail role')
                    .then((device)=>{
                        return device;
                    });
            }).catch((err)=>{
               console.error(err);
               return false;
            });
    },
    editJob : (jobId, query)=>{
        return Job.findOneAndUpdate({"_id" : jobId}, {$set: query}, {new : true}).then(async (job)=>{
            if(job) {
                await mScheduler.deleteJob(job);
                await mScheduler.addJob(job);
                return job;
            }
        }).catch((err)=>{
            console.error(err);
            return false;
        })

    },
    deleteJob: (jobId)=>{
        return Job.findOneAndRemove({"_id" : jobId}).then(async (job)=>{
            if(job){
                await mScheduler.deleteJob(job);
                return true;
            }else{
                console.warn('Unknown job');
                return false;
            }
        }).catch((err)=>{
            console.error(err);
            return false;
        })
    }
};


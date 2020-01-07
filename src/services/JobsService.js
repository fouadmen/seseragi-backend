const Job = require('../models/Jobs');
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

        const promise = new Promise(((resolve, reject) => {
            Job.create(newJob,(err, job)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(job);
                }
            })
        }));

        return promise.then((res)=>{
            return res;
        }).catch((err)=>{
            if(err.code === 11000){
                console.warn(err.errmsg);
                return true;
            }
            else{
                console.error(err);
                return false;
            }

        })

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


const Jobs = require('../models/Jobs');
const mScheduler =  require('../decorators/MyScheduler');

module.exports = async () => {
    Jobs.find({},(err, jobs)=>{
        if (err){
            console.log(err);
        }else {
            jobs.forEach(job=>mScheduler.addJob(job));
        }
    });
};

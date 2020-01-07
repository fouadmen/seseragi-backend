const Agenda = require("agenda");
const config = require('../config');
const process = require('process');
const {enableFunction, disableFunction} = require('../decorators');

const MAX_CONC = 1000;
const jobOptions = {timezone : 'Asia/Tokyo', skipImmediate: true};

function generateJobName(job) {
    const enableJobName = 'enableMode_'+job.command+'_'+job.deviceId;
    const disableJobName = 'disableMode_'+job.command+'_'+job.deviceId;
    return {enableJobName, disableJobName};
}


class mScheduler {

    constructor() {
        if(typeof mScheduler.instance === 'object')
            return mScheduler.instance;

        this.agenda = new Agenda({ db: {address: config.connectionString, collection:'agendaJobs'}, processEvery: '2 seconds', maxConcurrency : MAX_CONC});
        process.on('SIGTERM', this.endJobs);
        process.on('SIGINT', this.endJobs);
        setImmediate(async ()=> await this.agenda.start());
        mScheduler.instance = this;
        return this;
    }

    addJob = async  (job)=>{
        const {enableJobName, disableJobName} = generateJobName(job);

        if(!(await this.jobExists(enableJobName))){
            this.agenda.define(enableJobName, {}, enableFunction);
            this.agenda.define(disableJobName, {}, disableFunction);

            const jobData = {command : job.command, deviceId: job.deviceId};
            let enable_job = this.agenda.create(enableJobName, jobData);
            let disable_job = this.agenda.create(disableJobName, jobData);

            const _from = {...job.from.split(':')};
            const _to = {...job.to.split(':')};

            enable_job = enable_job.repeatEvery(`${_from[1]} ${_from[0]} * * *`, jobOptions);
            disable_job = disable_job.repeatEvery(`${_to[1]} ${_to[0]} * * *`, jobOptions);

            await enable_job.save();
            await disable_job.save();
        }

        return true;
    };

    endJobs = async ()=>{
        await this.agenda.stop();
        await this.agenda.purge();
    };

    deleteJob = async (job)=>{
        const {enableJobName, disableJobName} = generateJobName(job);
        await this.agenda.cancel({name : {$in : [enableJobName, disableJobName]}});
        return true;
    };

    jobExists = async (jobName)=>{
        const jobs = await this.agenda.jobs({name:jobName},{data:-1},1);
        return jobs.length !== 0 ;
    }
}


module.exports = new mScheduler();

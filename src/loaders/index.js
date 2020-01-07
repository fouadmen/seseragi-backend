const expressLoader = require('./express');
const mongoLoader = require('./mongoLoader');
const wsServerLoader = require('./wsServer');
const mqttServerLoader = require('./mqqtServer');
const jobsLoader = require('./JobsLoader');

module.exports = async ({expressApp})=>{

    await mongoLoader();

    await jobsLoader();

    await expressLoader({app : expressApp});

    await mqttServerLoader();

    return wsServerLoader({app: expressApp});
};

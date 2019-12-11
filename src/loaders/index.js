const expressLoader = require('./express');
const mongoLoader = require('./mongoLoader');
const wsServerLoader = require('./wsServer');
const mqttServerLoader = require('./mqqtServer');

module.exports = async ({expressApp})=>{

    await mongoLoader();

    await expressLoader({app : expressApp});

    await mqttServerLoader();

    return wsServerLoader({app: expressApp});
};

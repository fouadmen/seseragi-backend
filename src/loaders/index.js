const expressLoader = require('./express');
const mongoLoader = require('./mongoLoader');
//const wsServerLoader = require('./wsServer');

module.exports = async ({expressApp})=>{

    await mongoLoader();

    return await expressLoader({app : expressApp});
    //return await wsServerLoader(app);
};

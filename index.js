const express = require('express');
const config = require('./src/config');
const loaders = require('./src/loaders');
const process = require('process');

(async function startServer() {
    const app = express();

    const server = await loaders({expressApp : app});

    server.listen(config.port, (err)=>{
        if(err){
            console.error(err);
            process.exit(1);
        }else{
            console.info("Server is listening on ", config.port);
        }
    });
})();

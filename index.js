const express = require('express');
const config = require('./src/config');
const loaders = require('./src/loaders');

async function startServer() {
    const app = express();

    const server = await loaders({expressApp : app});

    server.listen(config.port, (err)=>{
        if(err){
            console.error(err);
            process.exit(1);
            return;
        }else{
            console.info("Server is listening on ", config.port);
        }
    });
}

startServer();

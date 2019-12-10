const app = require('./express');
const server = require('http').createServer(app);
const webSocketServer = require('websocket').server;
const port = process.env.PORT || 9000;

server.listen(port,()=>{
    console.log(`http/ws server listening on ${port}`);
});

module.exports = new webSocketServer({
    onlyHttp:false,
    httpServer: server
});

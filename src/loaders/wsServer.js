const webSocketServer = require('websocket').server;
const wsController = require('../controllers/wsController');

module.exports = ({app})=>{
    const server = require('http').createServer(app);
    const wsServer = new webSocketServer({ onlyHttp:false, httpServer: server });

    wsServer.on('request', wsController.requestHandler);
    wsServer.on('connection', wsController.connectionHandler);

    return server;
};

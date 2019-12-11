const axios = require('axios');
const clients = require('../shared');
const decorators  = require('../decorators');

function handleConnection(connection, query){
    const clientID = query._clientId;
    const connectionId = '_' + Math.random().toString(36).substr(2, 9);
    console.log(`client : ${connectionId} is connected`);
    connection.on('close', () => closeHandler(clientID, connectionId));
    connection.on('message', (message) => handleRequest(message));

    axios.get(`http://localhost:9000/devices/${clientID}`).then((devices) => {
        devices.data.forEach((d) => {
            if (!clients.wsClients[d.deviceId]) {
                clients.wsClients[d.deviceId] = [{
                    connection: connection,
                    connected: true,
                    connectionId: connectionId
                }];
            } else {
                clients.wsClients[d.deviceId].push({
                    connection: connection,
                    connected: true,
                    connectionId: connectionId
                });
            }
        });
    })
}

function handleRequest(message){
    if(message.type==='utf8' && typeof message.utf8Data !== undefined){
        const request = JSON.parse(message.utf8Data);
        switch (request.route) {
            case 'update':
                decorators.publishToClients(request.target, 'update/enable', decorators.statusChange);
                break;
            case 'control':
                decorators.publishToClients(request.target, 'control', null,request.param);
                break;
        }
    }
}

function closeHandler (clientID, connectionId){
    axios.get(`http://localhost:9000/devices/${clientID}`).then((response)=>{
        response.data.forEach((device)=>{
            if(clients.wsClients[device.deviceId].length===1){
                decorators.publishToClients(clientID, 'update/disable');
            }
            clients.wsClients[device.deviceId] = clients.wsClients[device.deviceId].filter(client => client.connectionId !== connectionId);
        });
        console.log("connection closed for client : " + connectionId + " of " + clientID);
    });
}

module.exports = {handleConnection};

const axios = require('axios');
const clients = require('../shared');
const decorators  = require('../decorators');
/***
 * Handles connection from client
 * @param connection: current connection
 * @param query: contains clientId and their generated token
 * */
function handleConnection(connection, query){
    const clientID = query._clientId;
    const token = query.token;
    const connectionId = '_' + Math.random().toString(36).substr(2, 9);
    console.log(`client : ${connectionId} is connected`);
    connection.on('close', () => closeHandler(clientID, connectionId, token));
    connection.on('message', (message) => handleRequest(message));
    axios.get(`http://localhost:9000/devices?owner=${clientID}`,{headers: { Authorization : token }})
        .then((res) => {
            res.data.forEach((device) => {
                if (!clients.wsClients[device.deviceId]) {
                    clients.wsClients[device.deviceId] = [{
                        connection: connection,
                        connected: true,
                        connectionId: connectionId
                    }];
                } else {
                    clients.wsClients[device.deviceId].push({
                        connection: connection,
                        connected: true,
                        connectionId: connectionId
                    });
                }
            });
        }).catch((err)=>{
            console.error(err);
        }
    )
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

function closeHandler (clientID, connectionId, token){
    axios.get(`http://localhost:9000/devices?owner=${clientID}`, {headers: { Authorization : token }}).then((response)=>{
        response.data.forEach((device)=>{
            if(clients.wsClients[device.deviceId].length===1){
                decorators.publishToClients(device.deviceId, 'update/disable');
            }
            clients.wsClients[device.deviceId] = clients.wsClients[device.deviceId].filter(client => client.connectionId !== connectionId);
        });
        console.log("connection closed for client : " + connectionId);
    });
}

module.exports = {handleConnection};

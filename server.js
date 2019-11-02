//TODO: this can be used to handle connection inactivity const timeout = require('infinite-timeout'); const NO_ACTIVITY_TIMEOUT = 20000;
const timeout =require('infinite-timeout');
const mosca= require('mosca');
const app = require('./http-server');
const server = require('http').createServer(app);
const axios = require('axios');
//const EvenEmitter = require('./EventEmitter');
const webSocketServer = require('websocket').server;
const Device = require("./models/Devices");
const port = process.env.PORT || 9000;
// Maintains all active connections in this object
console.log('port :', port);
const wsClients = {};
const mqttClients = {};
const wsServer = new webSocketServer({
    httpServer: server
});

server.listen(port,()=>{
    console.log(`http/ws server listening on ${port}`);
});

const moscaSettings = {
    port: 1883,
};
const mqttServer = new mosca.Server(moscaSettings, setup);

mqttServer.on('clientConnected', function(client) {
    console.log('client ');
    if(!mqttClients[client.id])
        mqttClients[client.id] = {clientId : client.id, timeout : timeout.set(()=>deleteMqttClient(client.id), 80000)};
    updateDeviceState(client.id, "connected");
});

mqttServer.on('published', function(packet) {
    //TODO: handle case when two clients want to reach the same device !
    const receivedData = packet;
    if(receivedData.topic === 'state'){
        const _data = JSON.parse(packet.payload.toString());
        timeout.clear(mqttClients[_data.clientId].timeout);
        if(wsClients[_data.clientId]){
            statusChange(_data);
        }
    } else if (receivedData.topic ==='outTopic') {
        const _data = JSON.parse(packet.payload.toString());
        let postRequests = [];
        timeout.clear(mqttClients[_data.clientId].timeout);
        (Object.keys(_data.data)).forEach((dataType)=>{
            const _newMeasure = {
                client: _data.clientId,
                type: dataType,
                value: _data.data[dataType],
                time:  Math.floor(Date.now() / 1000).toString()
            };
            postRequests.push(axios.post('http://localhost:9000/measures',_newMeasure));
        });
        axios.all(postRequests).catch(
            (err)=>console.log('Error while trying to post measures : ', err.message)
        )
    }
});

function setup() {
    console.log('Mqtt server is up and running');
}

function deleteMqttClient(clientId){
    updateDeviceState(clientId, "disconnect");
    delete mqttClients[clientId];
    console.log('Mqtt client has been deleted : ', clientId);
}

function updateDeviceState(deviceId, state){
    Device.findOneAndUpdate(
        {"deviceId" : deviceId},
        {$set:{"state" : state, "time": Math.floor(Date.now() / 1000).toString()}},
        {useFindAndModify:false},
        (err)=>{
            if(err){
                console.error('Error while updating device state : ', err);
            }
        }
    )
}
/*--------------------------------------------*/


wsServer.on('request', function(request) {
  console.log(' Received a new connection.');
  // TODO : accept only the requests from allowed origin
  const connection = request.accept(null, request.origin);
  const path = request.resourceURL.pathname;
  if(path==='/connect'){
    const q = request.resourceURL.query;
    if(q)
      handleConnection(connection, q);
  }
});

function handleConnection(connection, query) {
    let clientID = query._clientId;
    connection.on('close', ()=>closeHandler(clientID));
    connection.on('message', (message)=>handleRequest(message));
    if(!wsClients[clientID]){
        wsClients[clientID] = {
            connection : connection,
            connected : true,
            // timeout : timeout.set(()=>deleteClient(clientID), NO_ACTIVITY_TIMEOUT)
        };
    }
}

function handleRequest(message) {
    if(message.type==='utf8' && typeof message.utf8Data !== undefined){
        const request = JSON.parse(message.utf8Data);
        switch (request.route) {
            case 'update':
                publishToClients(request.target, 'update/enable', statusChange);
                break;
            case 'control':
                publishToClients(request.target, 'control', null,request.param);
                break;
        }
    }
}


function deleteClient(clientID) {
    delete wsClients[clientID];
    return;
}

function closeHandler(clientID) {
    publishToClients(clientID, 'update/disable');
    deleteClient(clientID);
    console.log("connection closed for client : " + clientID);
}

function publishToClients(clientId, topic, subCallback=null, payload = null) {
    const packet = {
        topic: topic,
        payload: payload === null ? clientId : clientId+'/'+payload,
        qos: 2,
        retain: false,
    };
    mqttServer.publish(packet, clientId, subCallback!==null ?
        function() {
            //EvenEmitter.subscribe(subCallback.name,subCallback);
            console.log(`MQTT broker message sent to ${clientId}`);
        }
        :
        ()=>{return;}
    );
}

function statusChange(_data) {
    _data["event"] = "update";
    wsClients[_data.clientId].connection.send(JSON.stringify(_data));
    console.log('message is sent');
}
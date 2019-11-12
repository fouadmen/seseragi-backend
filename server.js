//TODO: this can be used to handle connection inactivity const timeout = require('infinite-timeout'); const NO_ACTIVITY_TIMEOUT = 20000;
const timeout =require('infinite-timeout');
const mosca= require('mosca');
const app = require('./http-server');
const server = require('http').createServer(app);
const axios = require('axios');
const webSocketServer = require('websocket').server;
const Device = require("./models/Devices");
const port = process.env.PORT || 9000;
// Maintains all active connections in this object
console.log('port :', port);
const wsClients = {};
const mqttClients = {};
const wsServer = new webSocketServer({
    onlyHttp:false,
    httpServer: server
});
const inactivityTimeout = 70000;
server.listen(port,()=>{
    console.log(`http/ws server listening on ${port}`);
});

const moscaSettings = {
    port: 1883,
};
const mqttServer = new mosca.Server(moscaSettings, setup);

mqttServer.on('clientConnected', function(client) {
    console.log('new device is connected : ', client.id);
});

mqttServer.on('published', function(packet) {
    //TODO: handle case when two clients want to reach the same device !
    const receivedData = packet;
    if(receivedData.topic === 'state'){
        const _data = JSON.parse(packet.payload.toString());
        timeout.clear(mqttClients[_data.clientId].timeout);
        mqttClients[_data.clientId].timeout = timeout.set(()=>deleteMqttClient(_data.clientId), inactivityTimeout);
        if(wsClients[_data.clientId]){
            statusChange("update", _data);
        }
    } else if (receivedData.topic ==='outTopic') {
        const _data = JSON.parse(packet.payload.toString());
        let postRequests = [];
        timeout.clear(mqttClients[_data.clientId].timeout);
        mqttClients[_data.clientId].timeout = timeout.set(()=>deleteMqttClient(_data.clientId), inactivityTimeout);
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
    } else if (RegExp('new/subscribes', 'g').exec(receivedData.topic)) {
        const payload = JSON.parse(receivedData.payload);
        if(!mqttClients[payload.clientId])
            mqttClients[payload.clientId] = {clientId : payload.clientId, timeout : timeout.set(()=>deleteMqttClient(payload.clientId), inactivityTimeout)};
        if(payload.topic==='update/enable' && wsClients[payload.clientId]){
            updateDeviceState(payload.clientId, "connected");
            publishToClients(payload.clientId, 'update/enable', statusChange);
        }
    } else if (RegExp('disconnect/clients', 'g').exec(receivedData.topic)){
        const payload = JSON.parse(receivedData.payload);
        deleteMqttClient(payload.clientId);
    }
});

function setup() {
    console.log('Mqtt server is up and running');
}

function deleteMqttClient(clientId){
    timeout.clear(mqttClients[clientId].timeout);
    delete mqttClients[clientId];
    updateDeviceState(clientId, "disconnect");
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
            }else{
                statusChange('state', {clientId:deviceId, state:state});
            }
        }
    )
}
/*--------------------------------------------*/

wsServer.on('connection', function () {
    console.log('Client connected');
});

wsServer.on('request', function(request) {
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
    const connectionId = '_'+Math.random().toString(36).substr(2,9);
    console.log(`client : ${connectionId} is connected`);
    connection.on('close', ()=>closeHandler(clientID, connectionId));
    connection.on('message', (message)=>handleRequest(message));
    if(!wsClients[clientID]){
        console.log(`first client`);
        wsClients[clientID] = [{
            connection : connection,
            connected : true,
            connectionId : connectionId
        }];
    }else{
        console.log(`adding other client to the same device`);
        wsClients[clientID].push({
            connection : connection,
            connected : true,
            connectionId : connectionId
        });
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
                console.log('received control');
                publishToClients(request.target, 'control', null,request.param);
                break;
        }
    }
}

function closeHandler(clientID, connectionId) {
    if(wsClients[clientID].length===1){
        publishToClients(clientID, 'update/disable');
    }

    deleteClient(clientID, connectionId);
    console.log("connection closed for client : " + connectionId + " of " + clientID);
}

function deleteClient(clientID, connectionId) {
    wsClients[clientID] = wsClients[clientID].filter(client => client.connectionId !== connectionId);
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
        }
        :
        ()=>{return;}
    );
}

function statusChange(event, _data) {
    if(wsClients[_data.clientId]){
        _data["event"] = event;
        wsClients[_data.clientId].forEach((client)=>{
            client.connection.send(JSON.stringify(_data));
            console.log('Message is sent to connected client : ', _data.clientId);
        });
    }
}

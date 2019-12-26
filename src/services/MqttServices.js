const axios = require('axios');
const timeout =require('infinite-timeout');
const decorators  = require('../decorators');
const clients = require('../shared');
const Device = require('../models/Devices');
const inactivityTimeout = 70000;

function stateTopicHandler(_data){
    if(clients.mqttClients[_data.clientId]){
        timeout.clear(clients.mqttClients[_data.clientId].timeout);
        clients.mqttClients[_data.clientId].timeout = timeout.set(()=>deleteMqttClient(_data.clientId), inactivityTimeout);
    }

    if(clients.wsClients[_data.clientId]){
        decorators.statusChange("update", _data);
    }
}

function outTopicHandler(_data){
    let postRequests = [];
    if(clients.mqttClients[_data.clientId]){
        timeout.clear(clients.mqttClients[_data.clientId].timeout);
        clients.mqttClients[_data.clientId].timeout = timeout.set(()=>deleteMqttClient(_data.clientId), inactivityTimeout);
    }

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
function newSubscriptionHandler(payload){
    if(!clients.mqttClients[payload.clientId])
        clients.mqttClients[payload.clientId] = {clientId : payload.clientId, timeout : timeout.set(()=>deleteMqttClient(payload.clientId), inactivityTimeout)};
    if(payload.topic==='update/enable' && clients.wsClients[payload.clientId]){
        decorators.publishToClients(payload.clientId, 'update/enable', decorators.statusChange);
    }
}
function deleteMqttClient(clientId){
    if(clients.mqttClients[clientId]){
        timeout.clear(clients.mqttClients[clientId].timeout);
        delete clients.mqttClients[clientId];
        updateDeviceState(clientId, "disconnect");
        console.log('Mqtt client has been deleted : ', clientId);
    }
}
function updateDeviceState(deviceId, state){
    Device.findOneAndUpdate(
        {"deviceId" : deviceId},
        {$set:{"state" : state, "time": Math.floor(Date.now() / 1000).toString()}},
        (err)=>{
            if(err){
                console.error('Error while updating device state : ', err);
            }else{
                decorators.statusChange('state', {clientId:deviceId, state:state});
            }
        }
    )
}

module.exports = {stateTopicHandler,outTopicHandler, newSubscriptionHandler, updateDeviceState, deleteMqttClient};

const clients = require('../shared');
const mqttServer = require('../loaders/mqqtServer');

function publishToClients(clientId, topic, subCallback=null, payload = null){
    const packet = {
        topic: topic,
        payload: payload === null ? clientId : clientId+'/'+payload,
        qos: 2,
        retain: false,
    };
    mqttServer().publish(packet, clientId, subCallback!==null ? function() { } : ()=>{return;} );
}

function statusChange(event, _data){
    if(clients.wsClients[_data.clientId]) {
        _data["event"] = event;
        clients.wsClients[_data.clientId].forEach((client)=>{
            client.connection.send(JSON.stringify(_data));
        });
    }
}

exports.publishToClients = publishToClients;
exports.statusChange = statusChange;

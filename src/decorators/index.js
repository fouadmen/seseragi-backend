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

const enableFunc = async (job, done)=>{
    const {command, deviceId} = job.attrs.data;

    if(clients.mqttClients[deviceId]){
        console.log('enable command : ', command, deviceId);
        publishToClients(deviceId, 'control', null,command)
    }else{
        console.warn('Device is not in the connected list');
    }
    done();
};

const disableFunc = async (job, done)=>{
    const {command, deviceId} = job.attrs.data;

    if(clients.mqttClients[deviceId]){
        console.log('disable command : ', command, deviceId);
        switch (command) {
            case 'cpnpmode':
                publishToClients(deviceId, 'control', null,'cphrmode');
                break;
            case 'cphrmode':
                publishToClients(deviceId, 'control', null,'cpnpmode');
                break;
            default:
                publishToClients(deviceId, 'control', null,'cppower');
                break;
        }
    }else{
        console.log('Device is not in the connected list');
    }
    done();
};

exports.publishToClients = publishToClients;
exports.statusChange = statusChange;
exports.enableFunction = enableFunc;
exports.disableFunction = disableFunc;

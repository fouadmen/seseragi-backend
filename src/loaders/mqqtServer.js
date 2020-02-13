const mosca = require('mosca');
const mqttController = require('../controllers/mqttController');
const moscaSettings = {
    port: 1883,
};

function setup() {
    console.log('MQTT server is up and running');
}
let mqttServer = null;

module.exports = ()=>{
    if(!mqttServer){
        mqttServer = new mosca.Server(moscaSettings, setup);
        mqttServer.on('clientConnected',mqttController.connectHandler);
        mqttServer.on('published', mqttController.publishHandler);
    }

    return mqttServer;
};

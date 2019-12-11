const mqttServices = require('../services/MqttServices');

module.exports = {
    publishHandler : (packet)=>{
        //TODO: handle case when two clients want to reach the same device !
        const receivedData = packet;
        if(receivedData.topic === 'state'){
            const _data = JSON.parse(packet.payload.toString());
            mqttServices.stateTopicHandler(_data);
        } else if (receivedData.topic ==='outTopic') {
            const _data = JSON.parse(packet.payload.toString());
            mqttServices.outTopicHandler(_data);
        } else if (RegExp('new/subscribes', 'g').exec(receivedData.topic)) {
            const payload = JSON.parse(receivedData.payload);
            mqttServices.newSubscriptionHandler(payload);
        } else if (RegExp('disconnect/clients', 'g').exec(receivedData.topic)){
            const payload = receivedData.payload;
            mqttServices.deleteMqttClient(payload.clientId);
        }
    },
    connectHandler: (client)=>{
        console.log('new device is connected : ', client.id);
        mqttServices.updateDeviceState(client.id, "connected");
    }
};

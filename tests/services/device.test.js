const mongoose = require('mongoose');
const Devices = require('../../src/models/Devices');
const DevicesService = require('../../src/services/DevicesService');
const connectionString = 'mongodb://localhost:27017/SeseragiDB';

const validDeviceData = {
    "deviceId": "KK:6B:2D:99:7B:94",
    "time": "1578468492",
    "state": "connected",
    "owner": "fouadmannou@gmail.com",
    "name": "main"
};

const invalidDeviceData = {
    "time": "1578468492",
    "state": "connected",
    "owner": "fouadmannou@gmail.com",
    "name": "main"
};

const validDeviceId = "KK:6B:2D:99:7B:94";

const invalidDeviceId= "NN:6B:2D:99:7B:94";

const dataToModify = { "name" : "TEST NAME"};

function initializeDeviceDatabase(){
    return Promise.resolve(Devices.deleteOne({"deviceId": "KK:6B:2D:99:7B:94"}));
}

describe('Device services test', function () {
    beforeAll(async ()=>{
        await mongoose.connect(connectionString,{useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false},(err)=>{
            if (err) {
                console.error(err);
                process.exit(1);
            }
        });

    });

    afterAll(async (done) => {
        await initializeDeviceDatabase();
        await mongoose.disconnect(done);
    });

    it("Should create and save a valid device",async ()=>{
        expect.assertions(1);
        expect(await DevicesService.createDevice(validDeviceData))
            .toHaveProperty("_id");
    });

    it("Should not create and save an invalid device",async ()=>{
        expect.assertions(1);
        expect(await DevicesService.createDevice(invalidDeviceData))
            .toBe(false);
    });

    it("Should modify a valid device",async ()=>{
        expect.assertions(1);
        expect(await DevicesService.editDevice(validDeviceId, dataToModify))
            .toHaveProperty("deviceId");
    });

    it("Should not modify an invalid device",async ()=>{
        expect.assertions(1);
        expect(await DevicesService.editDevice(invalidDeviceId, dataToModify))
            .toBe(false);
    });

    it("Should delete a valid device",async ()=>{
        expect.assertions(1);
        expect(await DevicesService.deleteDevice(validDeviceId))
            .toBe(true);
    });

    it("Should not delete an invalid device",async ()=>{
        expect.assertions(1);
        expect(await DevicesService.deleteDevice(invalidDeviceId))
            .toBe(false);
    });



});

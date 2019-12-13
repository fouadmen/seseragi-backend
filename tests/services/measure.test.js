const mongoose = require('mongoose');
const Measures = require('../../src/models/Measure');
const MeasuresService = require('../../src/services/MeasuresService');
const connectionString = 'mongodb://localhost:27017/SeseragiDB';

const validDeviceData = {
    client: "B4:E6:2D:99:7B:74",
    type: "temperature",
    value: "21.5",
    time:  "1534678465"
};

const invalidDeviceData = {
    type: "temperature",
    value: "21.5",
    time:  "1534678465"
};

const deviceId = "B4:E6:2D:99:7B:74";
const type = "temperature";
const EmptyPeriod = {};
const validPeriod = { 'from': '1534678465'};
const invalidPeriod = { 'dummy': '1534678465'};

function initializeMeasureDatabase(){
    return Promise.resolve(Measures.deleteOne({"deviceId" : deviceId}));
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
        await initializeMeasureDatabase();
        await mongoose.disconnect(done);
    });

    it("Should create and save a valid measure",async ()=>{
        expect.assertions(1);
        expect(await MeasuresService.createMeasure(validDeviceData))
            .toBe(true);
    });

    it("Should not create and save an invalid measure",async ()=>{
        expect.assertions(1);
        expect(await MeasuresService.createMeasure(invalidDeviceData))
            .toBe(false);
    });

    it("Should return measures",async ()=>{
        expect.assertions(1);
        expect(await MeasuresService.getMeasures(deviceId, type, EmptyPeriod))
            .toBeDefined();
    });

    it("Should return measures for valid period",async ()=>{
        expect.assertions(1);
        expect(await MeasuresService.getMeasures(deviceId, type, validPeriod))
            .toBeDefined();
    });

    it("Should not return measures for invalid period",async ()=>{
        expect.assertions(1);
        expect(await MeasuresService.getMeasures(deviceId, type, invalidPeriod))
            .toEqual(expect.arrayContaining([]));
    });


});

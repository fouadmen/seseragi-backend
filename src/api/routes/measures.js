const express  =  require('express');
const MeasuresController = require('../../controllers/MeasuresController');
const router = express.Router();

module.exports = (app)=>{
    //TODO: only known origin devices can insert and fetch data

    router.get('/:deviceId/:dataType', MeasuresController.getMeasures);

    router.post('/', MeasuresController.createMeasure);

    app.use('/measures', router);
};


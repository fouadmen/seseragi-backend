const express  =  require('express');
const MeasuresController = require('../../controllers/MeasuresController');
const router = express.Router();

module.exports = (app,passport)=>{

    router.get('/:dataType',passport.authenticate('jwt', {session:false}), MeasuresController.getMeasures);

    router.post('/', MeasuresController.createMeasure);

    app.use('/measures', router);
};


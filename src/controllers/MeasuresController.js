const MeasuresService = require('../services/MeasuresService');
// @TODO : Create Logger
module.exports = {
    getMeasures : async (req, res)=>{
        const _dataType = req.params.dataType.toLowerCase();
        const _period = {};
        if(req.query.from)
            _period.from = req.query.from;
        if(req.query.to)
            _period.from = req.query.to;

        const measures = await MeasuresService.getMeasures(_dataType,req.query.deviceId, _period);
        if(measures){
            res.status(200).send(measures);
        }else{
            res.status(502).send(false);
        }
    },
    createMeasure : async (req, res)=>{
        const state = await MeasuresService.createMeasure(req.body);
        return state ? res.status(201).send(true) : res.status(502).send(false) ;
    }
};

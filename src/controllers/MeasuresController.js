const MeasuresService = require('../services/MeasuresService');
// @TODO : Create Logger
module.exports = {
    getMeasures : async (req, res)=>{
        const _dataType = req.params.dataType.toLowerCase();
        const _deviceId = req.params.deviceId;
        const _period = req.query;
        if(typeof _period === 'object'){
            const measures = await MeasuresService.getMeasures(_deviceId, _dataType, _period);
            if(measures){
                res.state(200).send(measures);
            }else{
                res.state(502).send(false);
            }
        }else{
            console.warn('period is ', _period);
            res.state(502).send(false);
        }
    },
    createMeasure : async (req, res)=>{
        const state = await MeasuresService.createMeasure(req.body);
        return state ? res.state(200).send(true) : res.state(502).send(false) ;
    }
};

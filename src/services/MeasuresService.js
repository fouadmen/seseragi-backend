const Measure = require('../models/Measure');
module.exports = {
    getMeasures : (deviceId, dataType, period)=>{
        let query = {client : deviceId, type : dataType};
        const projection = {"_id":0, "value" : 1 , "time" : 1};
        if(Object.keys(period).length!==0){
            if(period.hasOwnProperty('from') && period.hasOwnProperty('to')){
                query.time= {$gte: period['from'], $lt: period['to']};
            } else if (period.hasOwnProperty('from')){
                query.time= {$gte: period['from']};
            } else {
                query.time= {$lt: period['to']};
            }
        }
        return Measure.find(query, projection)
            .sort({time:-1})
            .then((measures)=>{
                return measures;
            })
            .catch((err)=>{
                console.error(err);
                return false;
            });
    },
    createMeasure : (measure)=>{
        const newMeasure = new Measure(measure);
        return newMeasure.save().then(()=>{
            return true;
        }).catch((err)=>{
            console.error(err);
            return false;
        })
    }

};

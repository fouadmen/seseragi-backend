const mongoose = require('mongoose');
//change to mongo
const config = require('../config');
module.exports = async ()=>{
     await mongoose.connect(config.connectionString,{useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false})
        .then(()=>console.log('Connected to MongoDB'))
        .catch(()=>console.log('Cannot connect to MongoDB'));
};

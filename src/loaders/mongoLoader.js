const mongoose = require('mongoose');
//change to mongo
const config = require('../config');
module.exports = async ()=>{
     await mongoose.connect(config.connectionString,{useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex:false, useFindAndModify:false})
        .then(()=>console.log('Connected to MongoDB'))
        .catch((err)=>console.log('Cannot connect to MongoDB', err));
};

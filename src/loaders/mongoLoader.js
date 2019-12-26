const mongoose = require('mongoose');
//change to mongo
const connectionString = 'mongodb://localhost:27017/SeseragiDB';
module.exports = async ()=>{
        await mongoose.connect(connectionString,{useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false})
            .then(()=>console.log('Connected to MongoDB'))
            .catch(()=>console.log('Cannot connect to MongoDB'));
    };

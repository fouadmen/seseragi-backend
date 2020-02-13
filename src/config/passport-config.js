const {Strategy, ExtractJwt} = require('passport-jwt');

const User = require('../models/Users');

const secret = 'SeseragiAPIPa$$word';

const opts = {
    jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret
};

module.exports = passport =>{
    passport.use(new Strategy(opts, (payload, done)=>{
        User.findOne({userId : payload.userId})
            .then(user=>{
               if(user){
                   return done(null, {
                       userId:user.userId,
                       thumbnail:user.thumbnail,
                       role:user.role,
                       name:user.name
                   })
               }
               return done(null, false);
            })
            .catch((err)=>{
                console.error(err);
                return false;
            });
    }))
};

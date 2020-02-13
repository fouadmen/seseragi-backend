const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');

const secret = 'SeseragiAPIPa$$word';
//TODO: very important ! inject object schema validator middleware !
module.exports = {
    register : async (newUser) => {
        const registerPromise = new Promise((resolve, reject) => {
            User.findOne({userId : newUser.userId}, (err, user)=>{
                if(err) return reject({code:500, err});
                if (user) return reject({code:400, err:"Account exists already"});
                const _user = new User(newUser);
                bcrypt.genSalt(10, (err, salt)=>{
                    if(err) return reject({code:500, err});
                    bcrypt.hash(_user.password, salt,(err, hash)=>{
                        if(err) return reject({code:500, err});
                        _user.password = hash;
                        _user.save((err, user)=>{
                            if(err) return reject({code:500, err});
                            const payload = {  userId : user.userId,  name : user.name };
                            jwt.sign(payload, secret, {expiresIn: 36000},(err, token)=>{
                                if(err) return reject({code:400, err:'Cannot Generate token'});
                                resolve({success:true, token:`Bearer ${token}`})
                            })
                        })
                    })
                });
            })
        });
        return registerPromise.then((tokenObj=>{return {success:true, tokenObj}})).catch((error)=>{return {success : false, error}});
    },

    /***
     * Logs in user
     * @param : Credentials Object {email, password}
     * */
    login : async (credentials) => {
        const loginPromise = new Promise((resolve, reject) => {
            const {email, password} = credentials;
            User.findOne({userId:email},(err, user)=>{
                if(err) return reject({code:500, err});
                if(!user) return reject({code:400, err:"No Account Found"});
                bcrypt.compare(password, user.password,(err, isMatch)=>{
                    if(err) return reject({code:500, err});
                    if (isMatch) {
                        const payload = {
                            userId : user.userId,
                            name : user.name
                        };
                        jwt.sign(payload, secret, {expiresIn: 18000},(err, token)=>{
                            if(err)  return reject({code:500, err});
                            resolve({success:true, token:`Bearer ${token}`});
                        });
                    }else{
                        reject({code:400, err:"Password is incorrect"});
                    }
                });
            })
        });

        return loginPromise.then((tokenObj=>{return {success:true, tokenObj}})).catch((error)=>{return {success : false, error}});
    },
};

const AuthService = require('../services/AuthService');

module.exports = {
    register : async (req, res) => {
        const status = await AuthService.register(req.body);
        if (status.success){
            res.status(201).json(status.tokenObj);
        }else{
            if(status.error.code===400) return res.status(status.error.code).json(status.error.err);
            console.error(status.error.err);
            res.status(status.error.code).json("Internal Error");
        }
    },

    login : async (req, res) => {
        const status = await AuthService.login(req.body);
        if (status.success){
            res.status(200).json(status.tokenObj);
        }else{
            if(status.error.code===400) return res.status(status.error.code).json(status.error.err);
            console.error(status.error.err);
            res.status(status.error.code).json("Internal Error");
        }
    },
};

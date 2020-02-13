const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const routes = require('../api');
const passport = require('passport');
const passportConfig = require('../config/passport-config');

module.exports = ({app})=>{
    app.use(methodOverride());
    app.use(bodyParser.json());
    app.use(passport.initialize());
    passportConfig(passport);
    app.get('/status', (req, res)=>{
        res.status(200).send('OK !');
    });

    app.use('/', routes(passport));

    return app;
};

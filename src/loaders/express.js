const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const routes = require('../api');
const config = require('../config');

module.exports = ({app})=>{
    app.use(methodOverride());
    app.use(bodyParser.json());

    app.get('/status', (req, res)=>{
        res.status(200).send('OK !');
    });

    app.use('/', routes());

    return app;
};

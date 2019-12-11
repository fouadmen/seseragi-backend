const webSocketService = require('../services/WsServices');
module.exports = {
    requestHandler: (request)=>{
        // TODO : accept only the requests from allowed origin
        const connection = request.accept(null, request.origin);
        const path = request.resourceURL.pathname;
        if(path==='/connect'){
            const q = request.resourceURL.query;
            if(q)
                webSocketService.handleConnection(connection, q);
        }
    },
    connectionHandler: ()=>{
        console.log('Client connected');
    }
};


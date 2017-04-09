/**
 * Created by ska on 4/9/17.
 */
'use strict';

const
    debug = require('debug')('api:server'),
    //async = require('async'),
    app = require('connect')(),
    cors = require('cors'),
    //fs = require('fs'),
    logger = require('morgan'),
    //_ = require('lodash'),
    cfg = require('./config.js'),
    swaggerHlp = require('./swagger-hlp'),
    promiseOf = require('./promiseOf');

/*
 if (!(cfg && cfg.db && cfg.db.connectParams)) {
 console.error('db connection config not set');
 process.exit(1);
 }
 */

app.use(logger('dev'));

/* Serve up public folder with swagger docs ui?

 var serveStatic = require('serve-static');
 var contentDisposition = require('content-disposition');
 var servePublic = serveStatic('public', {
 'index': false,
 'setHeaders': setHeaders
 });

 // Set header to force download
 function setHeaders(res, path) {
 res.setHeader('Content-Disposition', contentDisposition(path))
 }
 */


app.use('/', cors());

//add response shortcuts
app.use('/', function(req, res, next){
    //to set status and response
    res.xSet = function(status, data, next, contentType){
        this.xStatusCode = status;
        this.xContentType = contentType||'application/json';
        this.xData = data;
        if (next && ( typeof next === 'function' )) next();
    };
    next();
});


const apis = [
    {
        api:'./swagger.yaml',
        app: app,
        route: '',
        ctrlPath: './api-ctrl',
        cfg: cfg.games.api
    }
];


Promise
    .all(apis.map(api => {
        return promiseOf(next => {
            const ctrlService = require(api.ctrlPath);
            const ctrl = new ctrlService(api.cfg);
            swaggerHlp.attachApi(api.api, api.app, api.route, ctrl, next);
        })
    }))
    .then(() => {
        //send json response, actually
        app.use('/', function(req,res,next){
            if (res.xData||res.xStatusCode) {
                res.statusCode = res.xStatusCode;
                if (res.xContentType) {
                    res.setHeader('Content-Type', res.xContentType);
                    if (res.xContentType === 'application/json'){
                        res.end(JSON.stringify(res.xData, null, 2));
                    } else {
                        res.end(res.xData);
                    }
                } else {
                    if (res.xData) console.log(res.xStatusCode+' response with no contentType! ');
                    next();
                }
            } else {
                next();
            }
        });

        // catch 404 and forward to error handler
        app.use(function(req, res, next) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });


        app.use('/', function(err, req,res,next){
            if (!res.xStatusCode || (res.xStatusCode && res.xStatusCode < 400)) res.statusCode = err.status||err.statusCode||500;
            if (cfg.err && cfg.err.transform){
                res.setHeader('Content-Type', res.xContentType||cfg.err.contentType||'text');
                res.end(cfg.err.transform(err));
            }
            next(err);

        });

    });


//Create server
var srv;
if (cfg.server.ssl) {
    cfg.server.options.key = fs.readFileSync(cfg.server.options.key);
    cfg.server.options.cert = fs.readFileSync(cfg.server.options.cert);

    var https = require('https');
    srv = https.createServer(cfg.server.options, app);
} else {
    var http = require('http');
    srv = http.createServer(app);
}

// Start the server
srv.listen(cfg.server.port, function () {
    debug('Your server is listening on port %d ('+(cfg.server.ssl?'https':'http')+'://localhost:%d)', cfg.server.port, cfg.server.port);
    debug('Swagger-ui is available on '+(cfg.server.ssl?'https':'http')+'://localhost:%d/docs', cfg.server.port);
});

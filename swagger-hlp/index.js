/**
 * Created by ska on 11/5/16.
 */
'use strict';

const
  debug = require('debug')('swagger-hlp'),
  fs = require('fs'),
  swaggerTools = require('swagger-tools'),
  jsyaml = require('js-yaml'),
  cfg = require('../config.js');


module.exports.p2o = function(req) {
  var obj = {};
  Object.keys(req.swagger.params).forEach(function(key){ obj[key] = req.swagger.params[key].value; });
  return obj;
};

module.exports.attachApi = function(path, app, route, ctrl, callback){

  // The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
  var spec = fs.readFileSync(path, 'utf8');
  var swaggerDoc = jsyaml.safeLoad(spec);

//adjust swaggerDoc options
  if (process.env.NODE_ENV === 'development') {
    swaggerDoc.host = 'localhost:'+cfg.server.port;
  } else  {
    swaggerDoc.host = swaggerDoc.host+':'+cfg.server.port;
  }
  if (!cfg.server.ssl) {
    swaggerDoc.schemes = swaggerDoc.schemes.map(function(scheme){
      return scheme==='https'?'http':scheme;
    });
  }

// Initialize the Swagger middleware
  swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
    // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
    app.use(route, middleware.swaggerMetadata());

    // Validate Swagger requests
    app.use(route, middleware.swaggerValidator());

    // Security Swagger requests
    app.use(route, middleware.swaggerSecurity({
      apiKey: function (req, authOrSecDef, scopesOrApiKey, callback) {
        console.log('apiKey check skip', scopesOrApiKey);
        callback(null);
      }
    }));

    // Route validated requests to appropriate controller
    app.use(route, middleware.swaggerRouter({
      controllers: ctrl,
      useStubs: process.env.NODE_ENV === 'development?' // Conditionally turn on stubs (mock mode)  not sure what is that
    }));

    // Serve the Swagger documents and Swagger UI
    app.use(route, middleware.swaggerUi({
      swaggerUiDir:"./swagger-ui/dist"
    }));

    callback();

  });

};
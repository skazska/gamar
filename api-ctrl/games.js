/**
 * Created by ska on 4/9/17.
 */
"use strict";

const
    debug = require('debug')('api:ctrl'),
    Storage = require('@skazska/caching'),
    //svc = require('../storage/games.js'),
    swaggerHlp = require('../swagger-hlp'),
    cfg = require('../config.js')

const svc = new Storage.Redis('cacheId-ToDo(no meaning now)', {}, cfg.games.redis);

module.exports.getGameList = (req, res, next) => {
    svc.list('*').then(
        keys => {
            res.xSet(200, keys, next)
        },
        next
    );
};

module.exports.newGame = function(req,res,next){
    var task = swaggerHlp.p2o(req).task;
    task.type = 'arbitr-ru-find';
    if (task.params){
        if (task.params.dateFrom) task.params.dateFrom = new Date(task.params.dateFrom);
        if (task.params.dateTo) task.params.dateTo = new Date(task.params.dateTo);
    }
    svc.create(task, function(err, task){
        res.xSet(200, task, next);
    });
};

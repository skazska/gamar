/**
 * Created by ska on 4/9/17.
 */
"use strict";

const
    Redis = require("redis"),
    promiseOf = require('../promiseOf'),
    cfg = require('../config'),
    redis = Redis.createClient(cfg.games.redis)

module.exports.list = params => {
    return promiseOf(
        redis.keys.bind(redis, '*'),
        resolveArgs => {
            if (resolveArgs && resolveArgs.length)
                return [ resolveArgs ]
        }
    );
}

module.exports.get = params => {
    return promiseOf(
        redis.get.bind(redis, params.gameId),
        resolveArgs => {
            if (resolveArgs && resolveArgs.length)
                return [ resolveArgs ]
        }
    );
}

module.exports.put = params => {
    return promiseOf(
        redis.get.bind(redis, params.gameId),
        resolveArgs => {
            if (resolveArgs && resolveArgs.length)
                return [ resolveArgs ]
        }
    );
}

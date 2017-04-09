/**
 * Created by ska on 4/9/17.
 */
const _ = require('lodash');
const debug = require('debug')('web:config');

module.exports = {
    server: {
        port: process.env.PORT || '3000',
        ssl: false,
        options: {
            key: '~/.ssh/serv-key.pem',
            cert: '~/.ssh/serv-cert.pem'
        }

    },
    games: {
        api: {},
        redis: {
            db: 13
        }
    }
};

if (process.env.NODE_ENV){
    debug('Run with ' + process.env.NODE_ENV + ' environment config');
} else {
    debug('environment not specified, do run with development config');
}

module.exports = _.extend(
    module.exports,
    require('./config/' + (process.env.NODE_ENV||'development')) || {}
);

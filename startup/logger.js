require('express-async-errors');
const { createLogger, format, transports } = require('winston');
//require('winston-mongodb');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
          }),
        format.json(),
        format.prettyPrint()
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'logfile.log' }),
        //new transports.MongoDB({ db: 'mongodb://localhost/vidly' })
    ],
    exceptionHandlers: [
        new transports.Console(),
        new transports.File({ filename: 'uncaughtExceptions.log' }),
        //new transports.MongoDB({ db: 'mongodb://localhost/vidly' })
    ]
});

module.exports.logger = logger;
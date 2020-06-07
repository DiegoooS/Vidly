const { logger } = require('./logger');
const mongoose = require('mongoose');
const config = require('config');

module.exports = function() {
    const db = config.get('db');
    mongoose.connect(db, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true })
        .then(() => logger.info(`Connected to ${ db }`));
    mongoose.set('useFindAndModify', false);
};
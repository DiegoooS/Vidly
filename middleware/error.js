const { logger } = require('../startup/logger');

module.exports = function (err, req, res, next) {
    logger.info({
        message: err.message,
        metadata: { stack: err.stack }
    });
    res.status(500).send('Something failed.');
};
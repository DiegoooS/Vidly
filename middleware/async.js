
//NOT IN USE. JUST IN CASE IF EXPRESS-ASYNC-ERRORS NOT WORK
module.exports = function asyncMiddleware(handler) {
    return async(req, res, next) => {
        try {
            await handler(req, res);
        }
        catch (ex) {
            next(ex);
        }
    };
};
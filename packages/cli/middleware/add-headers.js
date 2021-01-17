const addHeaders = (req, res, next) => {
    req.headers['X-Middleware-Header'] = 'middleware header value';
    next();
};

module.exports = addHeaders;
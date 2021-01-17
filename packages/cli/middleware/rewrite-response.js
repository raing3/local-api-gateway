const rewriteResponse = (req, res, next) => {
    res.status(401).json({
        message: 'lol'
    });
};

module.exports = rewriteResponse;
const notFound = async (req, res, next) => {
    await next();

    res.status(404).json({
        message: 'Not found'
    });
};

module.exports = notFound;
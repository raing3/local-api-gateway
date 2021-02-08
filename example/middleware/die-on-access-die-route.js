const dieOnAccessDieRoute = (req, res, next) => {
    if (req.path === '/die' || req.path.startsWith('/die/')) {
        console.log('Press F to pay respects.');
        process.exit(0);
    }

    next();
};

module.exports = dieOnAccessDieRoute;

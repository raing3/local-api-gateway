const fs = require('fs');

module.exports = (targetValue) => {
    if (!fs.existsSync(targetValue)) {
        return [{ message: `file "${targetValue}" does not exist` }];
    }
}

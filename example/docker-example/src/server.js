const express = require('express');
const app = express();

app.get('/*', (req, res) => {
    res.send(`Hello from docker example integration.`);
});

app.listen(80, '0.0.0.0');

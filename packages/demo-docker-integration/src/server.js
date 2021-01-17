const express = require('express');

const port = 8080;
const host = '0.0.0.0';
const app = express();

app.get('/*', (req, res) => {
    res.send('Hello from demo docker integration zzz');
});

app.listen(port, host);

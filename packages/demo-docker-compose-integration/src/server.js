const express = require('express');

const port = 8080;
const host = '0.0.0.0';
const app = express();

app.get('/*', (req, res) => {
    res.send(`Hello from demo docker compose ${process.env.SERVICE_NAME} integration ${JSON.stringify(req.headers)}`);
});

app.listen(port, host);

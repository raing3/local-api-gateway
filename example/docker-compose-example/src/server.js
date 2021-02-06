const express = require('express');
const app = express();

app.get('/*', (req, res) => {
    res.send(`Hello from docker compose example (${process.env.SERVICE_NAME}) integration.`);
});

app.listen(80, '0.0.0.0');

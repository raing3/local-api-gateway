const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/*', async (req, res) => {
    let subRequestResponse = '';

    if (process.env.PROXY_TO) {
        const subRequest = await fetch(`http://${process.env.PROXY_TO}`);

        subRequestResponse = await subRequest.text();
    }

    res.send(
        `Hello from docker compose example (${process.env.SERVICE_NAME}) integration.<br />` +
        `${subRequestResponse}`
    );
});

app.listen(80, '0.0.0.0');

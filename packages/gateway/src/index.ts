#!/usr/bin/env node
import express from 'express';
import path from 'path';
import cors from 'cors';
import { parseConfig } from '@local-api-gateway/utils';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { traceId } from './middleware/trace-id';

const config = parseConfig('/local-api-gateway/.local-api-gateway/gateway.config.yml');
const host = '0.0.0.0';
const port = 80;
const app = express();
const middleware = [traceId(config.middleware.traceId), cors(config.middleware.cors)];

Object.values(config.middleware).forEach(item => {
    if (item.path) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, no-eval
        middleware.push(eval('require')(path.resolve('/local-api-gateway', item.path)));
    }
});

middleware.forEach(item => {
    app.use(item);
});

Object.values(config.integrations).forEach(integration => {
    Object.values(integration.services).forEach(service => {
        service.routes.forEach(route => {
            const proxy = createProxyMiddleware({
                target: `http://${service.name}:${route.port}`,
                changeOrigin: false,
                logLevel: 'debug'
            });

            route.paths.forEach(routePath => {
                app.use(routePath, proxy);
            });
        });
    });
});

app.listen(port, host);

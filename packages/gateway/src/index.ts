import express from 'express';
import path from 'path';
import { parseConfig } from '@local-api-gateway/utils';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { addTraceId } from './middleware/add-trace-id';

const config = parseConfig('/local-api-gateway/.local-api-gateway/config.gateway.yml');
const host = '0.0.0.0';
const port = 80;
const app = express();
const middleware = [addTraceId(config.gateway.traceIdHeaderName || 'Trace-Id')];

Object.values(config.middleware).forEach(item => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, no-eval
    middleware.push(eval('require')(path.resolve('/local-api-gateway', item.path)));
});

middleware.forEach(item => {
    app.use(item);
});

Object.values(config.integrations).forEach(integration => {
    integration.routes.forEach(route => {
        const proxy = createProxyMiddleware({
            target: `http://${route.service}:${route.port}`,
            changeOrigin: true,
            logLevel: 'debug'
        });

        route.paths.forEach(routePath => {
            app.use(routePath, proxy);
        });
    });
});

app.listen(port, host);

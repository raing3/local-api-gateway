import { parse } from 'yaml';
import fs from 'fs';
import { Config } from '@local-api-gateway/types';
import path from 'path';

export const resolveUriLocalPath = (uri: string): string => {
    const parsed = new URL(uri);

    switch (parsed.protocol) {
        case 'file:':
            return path.relative(process.cwd(), path.resolve(uri.split(':')[1]));
    }

    throw new Error(`Unsupported URI, cannot handle ${uri}`);
};

export const parseConfig = (configPath: string): Config => {
    const parsed = parse(fs.readFileSync(configPath, 'utf8'));
    const config = {
        ...parsed,
        gateway: {
            host: 'localhost',
            port: 80,
            traceIdHeaderName: 'Trace-Id',
            ...parsed?.gateway
        },
        middleware: {
            ...parsed?.middleware
        },
        integrations: {
            ...parsed?.integrations
        }
    } as Config;

    Object.entries(config.integrations).forEach(([integrationName, integration]) => {
        if (!integration?.destination) {
            try {
                integration.destination = resolveUriLocalPath(integration.source);
            } catch (error) {
                integration.destination = `./${integrationName}`;
            }
        }
    });

    if (config.gateway.source) {
        config.gateway.source = resolveUriLocalPath(config.gateway.source);
    }

    return config;
};

export const clone = <T>(value: T): T => {
    return JSON.parse(JSON.stringify(value)) as T;
};

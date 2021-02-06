import { parse } from 'yaml';
import fs from 'fs';
import { Config } from '@local-api-gateway/types';

export const parseConfig = (configPath: string): Config => {
    if (!fs.existsSync(configPath)) {
        throw new Error(`Configuration file "${configPath}" does not exist.`);
    }

    const parsed = parse(fs.readFileSync(configPath, 'utf8'));
    const config: Config = {
        ...parsed,
        gateway: {
            host: 'localhost',
            port: 80,
            ...parsed?.gateway
        },
        middleware: {
            cors: {
                ...parsed?.middleware?.cors
            },
            traceId: {
                header: 'X-Trace-Id',
                ...parsed?.middleware?.traceId
            },
            ...parsed?.middleware
        },
        integrations: {
            ...parsed?.integrations
        }
    };

    Object.entries(config.integrations).forEach(([integrationName, integration]) => {
        if (integration.source.type === 'path') {
            integration.destination = integration.source.url;
        }

        if (!integration.destination) {
            integration.destination = `./${integrationName}`;
        }

        if (typeof integration.build === 'string') {
            integration.build = [integration.build];
        }
    });

    return config;
};

export const clone = <T>(value: T): T => {
    return JSON.parse(JSON.stringify(value)) as T;
};

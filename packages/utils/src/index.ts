import { parse } from 'yaml';
import fs from 'fs';
import { Config } from '@local-api-gateway/types';

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
            cors: {
                ...parsed?.middleware?.cors
            },
            'trace-id': {
                header: 'X-Trace-Id',
                ...parsed?.middleware?.['trace-id']
            },
            ...parsed?.middleware
        },
        integrations: {
            ...parsed?.integrations
        }
    } as Config;

    Object.entries(config.integrations).forEach(([integrationName, integration]) => {
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

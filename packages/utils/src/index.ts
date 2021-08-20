import { parse } from 'yaml';
import fs from 'fs';
import { Config } from '@local-api-gateway/types';
import { Dictionary, IntegrationNetworkConfig } from '@local-api-gateway/types/src';

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
        integrations: {},
        networks: {
            ...parsed?.networks || []
        },
        extraHosts: [...parsed?.extraHosts || []]
    };

    if (parsed?.integrations) {
        Object.entries(parsed.integrations as Dictionary<any>).forEach(([integrationName, integration]) => {
            integration = integration || {};
            integration.services = integration.services || {};

            if (integration.source?.type === 'path') {
                integration.destination = integration.source.url;
            }

            if (!integration.destination) {
                integration.destination = `./${integrationName}`;
            }

            if (typeof integration.build === 'string') {
                integration.build = [integration.build];
            }

            if (integration.routes || integration.ports || integration.networks) {
                integration.services = {
                    _default: { // eslint-disable-line
                        routes: integration.routes,
                        ports: integration.ports,
                        networks: integration.networks
                    }
                };

                delete integration.routes;
                delete integration.ports;
                delete integration.networks;
            }

            Object.values(integration.services as Dictionary<any>).forEach(service => {
                service.routes = service.routes || [];
                service.ports = service.ports || [];
                service.networks = service.networks || {};

                if (service.networks instanceof Array) {
                    service.networks = (service.networks as string[]).reduce((normalised, network) => {
                        normalised[network] = {
                            aliases: []
                        };

                        return normalised;
                    }, {} as Dictionary<IntegrationNetworkConfig>);
                } else {
                    Object.values(service.networks as Dictionary<any>).forEach(network => {
                        network.aliases = network.aliases || [];
                    });
                }
            });

            config.integrations[integrationName] = integration;
        });
    }

    return config as Config;
};

export const clone = <T>(value: T): T => {
    return JSON.parse(JSON.stringify(value)) as T;
};

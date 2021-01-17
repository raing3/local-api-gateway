import { Context } from '../types';
import path from 'path';
import { parseConfig } from '@local-api-gateway/utils';

export const createContext = (configPath: string): Context => {
    const config = parseConfig(configPath);
    const buildDirectory = path.resolve(configPath, '..', '.local-api-gateway');
    const context: Context = {
        config: config,
        network: {
            name: config.name
        },
        gateway: {
            name: 'gateway',
            type: 'gateway',
            destination: process.cwd(),
            services: {}
        },
        integrations: {},
        directories: {
            build: buildDirectory
        },
        files: {
            config: path.resolve(configPath),
            dockerCompose: path.resolve(buildDirectory, 'docker-compose.yml'),
            gatewayConfig: path.resolve(buildDirectory, 'gateway.config.yml'),
            gatewayDockerfile: path.resolve(buildDirectory, 'Dockerfile-gateway')
        }
    };

    context.integrations[context.gateway.name] = context.gateway;

    Object.keys(config.integrations).forEach(integrationName => {
        const integrationConfig = config.integrations[integrationName];

        context.integrations[integrationName] = {
            name: integrationName,
            type: integrationConfig.type as string,
            destination: path.resolve(integrationConfig.destination),
            services: {},
            config: integrationConfig
        };
    });

    return context;
};

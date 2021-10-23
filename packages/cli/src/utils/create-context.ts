import { Context } from '../types';
import { parseConfig } from '@local-api-gateway/utils';
import path from 'path';

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
            destination: process.cwd()
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
            config: integrationConfig
        };
    });

    return context;
};

import {
    Config,
    Dictionary,
    DockerComposeIntegrationConfig,
    DockerIntegrationConfig,
    IntegrationConfig
} from '@local-api-gateway/types';
import { DockerCompose } from './docker-compose';

export type IntegrationContextBase = {
    type: string;
    name: string;
    destination: string;
    dockerCompose?: DockerCompose;
    config: IntegrationConfig;
};

export type DockerIntegrationContext = IntegrationContextBase & {
    type: 'docker';
    config: DockerIntegrationConfig;
};

export type DockerComposeIntegrationContext = IntegrationContextBase & {
    type: 'docker-compose';
    config: DockerComposeIntegrationConfig;
};

export type GatewayIntegrationContext = Omit<IntegrationContextBase, 'config'> & {
    type: 'gateway';
};

export type IntegrationContext =
    IntegrationContextBase|
    GatewayIntegrationContext|
    DockerIntegrationContext|
    DockerComposeIntegrationContext;

export type Context = {
    config: Config;
    network: {
        name: string;
    };
    gateway: GatewayIntegrationContext;
    integrations: Dictionary<IntegrationContext>;
    directories: {
        build: string;
    };
    files: {
        config: string;
        dockerCompose: string;
        gatewayConfig: string;
        gatewayDockerfile: string;
    };
};

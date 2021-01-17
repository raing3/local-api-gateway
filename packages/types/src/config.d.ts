import { Dictionary } from './dictionary';

export type MiddlewareConfig = {
    path: string;
};

export type RouteConfig = {
    service?: string;
    port: number;
    paths: string[];
};

export type IntegrationConfigBase = {
    type: string;
    source: string;
    destination: string;
    routes: RouteConfig[];
};

export type DockerIntegrationConfig = IntegrationConfigBase & {
    type: 'docker';
};

export type DockerComposeIntegrationConfig = IntegrationConfigBase & {
    type: 'docker-compose';
};

export type IntegrationConfig = IntegrationConfigBase|DockerIntegrationConfig|DockerComposeIntegrationConfig;

export type Config = {
    name: string;
    gateway: {
        host: string;
        port: number;
        source?: string;
        traceIdHeaderName: string;
    },
    middleware: Dictionary<MiddlewareConfig>;
    integrations: Dictionary<IntegrationConfig>;
};

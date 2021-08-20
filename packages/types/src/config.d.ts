import { Dictionary } from './dictionary';

export type MiddlewareConfig = {
    path: string;
};

export type RouteConfig = {
    port: number;
    paths: string[];
};

export type PathSource = {
    type: 'path';
    url: string;
};

export type VcsSource = {
    type: 'vcs',
    url: string;
};

export type IntegrationNetworkConfig = {
    aliases: string[];
};

export type IntegrationServiceConfig = {
    name: string;
    ports: string[];
    networks: Dictionary<IntegrationNetworkConfig>;
    routes: RouteConfig[];
};

export type IntegrationConfigBase = {
    type: string;
    source: PathSource|VcsSource;
    build: string[];
    destination: string;
    context?: string;
    services: Dictionary<IntegrationServiceConfig>;
};

export type DockerIntegrationConfig = IntegrationConfigBase & {
    type: 'docker';
};

export type DockerComposeIntegrationConfig = IntegrationConfigBase & {
    type: 'docker-compose';
};

export type IntegrationConfig = IntegrationConfigBase|DockerIntegrationConfig|DockerComposeIntegrationConfig;

export type NetworkConfig = {
    driver: string;
};

export type TraceIdMiddlewareConfig = {
    header: string;
};

export type CorsMiddlewareConfig = {
    origin?: boolean|string|RegExp|(string|RegExp)[];
    allowedHeaders?: string|string[];
    exposedHeaders?: string|string[];
    credentials?: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
};

export type Config = {
    name: string;
    gateway: {
        host: string;
        port: number;
        source?: string;
    },
    middleware: Dictionary<MiddlewareConfig> & {
        traceId: TraceIdMiddlewareConfig;
        cors: CorsMiddlewareConfig;
    };
    integrations: Dictionary<IntegrationConfig>;
    networks: Dictionary<NetworkConfig>;
    extraHosts: string[];
};

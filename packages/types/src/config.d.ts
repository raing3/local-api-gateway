import { Dictionary } from './dictionary';

export type MiddlewareConfig = {
    path: string;
};

export type RouteConfig = {
    service?: string;
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
}

export type IntegrationConfigBase = {
    type: string;
    source: PathSource|VcsSource;
    build: string[];
    destination: string;
    context?: string;
    routes: RouteConfig[];
};

export type DockerIntegrationConfig = IntegrationConfigBase & {
    type: 'docker';
};

export type DockerComposeIntegrationConfig = IntegrationConfigBase & {
    type: 'docker-compose';
};

export type IntegrationConfig = IntegrationConfigBase|DockerIntegrationConfig|DockerComposeIntegrationConfig;

export type TraceIdMiddlewareConfig = {
    header: string;
}

export type CorsMiddlewareConfig = {
    'access-control-allow-origin'?: string[];
    'access-control-allow-methods'?: string;
    'access-control-allow-headers'?: string;
    'access-control-allow-credentials'?: string;
}

export type Config = {
    name: string;
    gateway: {
        host: string;
        port: number;
        source?: string;
    },
    middleware: Dictionary<MiddlewareConfig> & {
        'trace-id': TraceIdMiddlewareConfig;
        cors: CorsMiddlewareConfig;
    };
    integrations: Dictionary<IntegrationConfig>;
};

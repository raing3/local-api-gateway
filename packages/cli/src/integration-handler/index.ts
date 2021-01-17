import { DockerIntegrationHandler } from './docker-integration-handler';
import { IntegrationContext, IntegrationHandler } from '../types';
import { Dictionary } from '@local-api-gateway/types';
import { GatewayIntegrationHandler } from './gateway-integration-handler';
import { DockerComposeIntegrationHandler } from './docker-compose-integration-handler';

const handlers: Dictionary<IntegrationHandler> = {
    docker: new DockerIntegrationHandler(),
    gateway: new GatewayIntegrationHandler(),
    'docker-compose': new DockerComposeIntegrationHandler()
};

export const getIntegrationHandler = (integration: IntegrationContext): IntegrationHandler => {
    const type = integration.type;

    if (type in handlers) {
        return handlers[type];
    }

    throw new Error(`Unknown integration type "${type}" for "${integration.name}", cannot start.`);
};

import { Context, DockerCompose, IntegrationContext } from '../types';
import { DockerComposeIntegrationHandler } from './docker-compose-integration-handler';

export class DockerIntegrationHandler extends DockerComposeIntegrationHandler {
    generateDockerCompose(context: Context, integration: IntegrationContext): DockerCompose {
        return {
            version: '3.8',
            services: {
                [integration.name]: {
                    build: {
                        context: integration.destination
                    }
                }
            }
        };
    }
}

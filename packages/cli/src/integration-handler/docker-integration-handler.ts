import {Context, DockerCompose, DockerIntegrationContext, IntegrationHandler} from '../types';
import path from "path";

export class DockerIntegrationHandler implements IntegrationHandler {
    generateDockerCompose(context: Context, integration: DockerIntegrationContext): DockerCompose {
        return {
            version: '3.8',
            services: {
                [integration.name]: {
                    build: {
                        context: path.resolve(integration.destination, integration.config.context || '')
                    }
                }
            }
        };
    }
}

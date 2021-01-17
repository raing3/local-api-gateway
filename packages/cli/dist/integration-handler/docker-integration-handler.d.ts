import { Context, DockerCompose, IntegrationContext } from '../types';
import { DockerComposeIntegrationHandler } from './docker-compose-integration-handler';
export declare class DockerIntegrationHandler extends DockerComposeIntegrationHandler {
    generateDockerCompose(context: Context, integration: IntegrationContext): DockerCompose;
}

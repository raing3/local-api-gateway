import { Context, DockerCompose, IntegrationContext, IntegrationHandler } from '../types';
export declare class DockerComposeIntegrationHandler implements IntegrationHandler {
    generateDockerCompose(context: Context, integration: IntegrationContext): DockerCompose;
}

import { DockerIntegrationHandler } from './docker-integration-handler';
import { Context, DockerCompose, IntegrationContextBase } from '../types';
export declare class GatewayIntegrationHandler extends DockerIntegrationHandler {
    generateDockerCompose(context: Context, integration: IntegrationContextBase): DockerCompose;
    private static generateDockerfile;
}

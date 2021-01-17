import { Context, DockerCompose, IntegrationContext } from '../types';

export type IntegrationHandler = {
    generateDockerCompose(context: Context, integration: IntegrationContext): DockerCompose;
};

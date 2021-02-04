import { Context, DockerCompose, DockerComposeIntegrationContext, IntegrationHandler } from '../types';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

export class DockerComposeIntegrationHandler implements IntegrationHandler {
    generateDockerCompose(context: Context, integration: DockerComposeIntegrationContext): DockerCompose {
        const pathSegments = [integration.destination, integration.config.context || '', 'docker-compose.yml'];
        const dockerCompose = fs.readFileSync(path.resolve(...pathSegments), 'utf8');

        return yaml.parse(dockerCompose) as DockerCompose;
    }
}

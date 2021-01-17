import { Context, DockerCompose, IntegrationContext, IntegrationHandler } from '../types';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

export class DockerComposeIntegrationHandler implements IntegrationHandler {
    generateDockerCompose(context: Context, integration: IntegrationContext): DockerCompose {
        const dockerCompose = fs.readFileSync(path.resolve(integration.destination, 'docker-compose.yml'), 'utf8');

        return yaml.parse(dockerCompose) as DockerCompose;
    }
}

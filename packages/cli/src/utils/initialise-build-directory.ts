import { generateDockerCompose } from './generate-docker-compose';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { Context } from '../types';
import { generateGatewayConfig } from './generate-gateway-config';

export const initialiseBuildDirectory = (context: Context): void => {
    if (!fs.existsSync(context.directories.build)) {
        fs.mkdirSync(context.directories.build);
    }

    const buildDirectory = context.directories.build;
    const dockerCompose = generateDockerCompose(context);
    const gatewayConfig = generateGatewayConfig(context);

    fs.writeFileSync(path.resolve(buildDirectory, 'docker-compose.yml'), yaml.stringify(dockerCompose));
    fs.writeFileSync(path.resolve(buildDirectory, 'config.gateway.yml'), yaml.stringify(gatewayConfig));
};

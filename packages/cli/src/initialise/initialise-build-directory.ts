import { Context } from '../types';
import fs from 'fs';
import { generateDockerCompose } from './generate-docker-compose';
import { generateGatewayDockerfile } from './generate-gateway-dockerfile';
import yaml from 'yaml';

export const initialiseBuildDirectory = (context: Context): void => {
    const buildDirectory = context.directories.build;
    const dockerCompose = generateDockerCompose(context);
    const gatewayDockerfile = generateGatewayDockerfile(context);

    if (!fs.existsSync(buildDirectory)) {
        fs.mkdirSync(buildDirectory);
    }

    fs.writeFileSync(context.files.dockerCompose, yaml.stringify(dockerCompose));
    fs.writeFileSync(context.files.gatewayConfig, yaml.stringify(context.config));
    fs.writeFileSync(context.files.gatewayDockerfile, gatewayDockerfile);
};

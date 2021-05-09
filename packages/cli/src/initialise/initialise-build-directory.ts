import { generateDockerCompose } from './generate-docker-compose';
import fs from 'fs';
import yaml from 'yaml';
import { Context } from '../types';
import { generateGatewayDockerfile } from './generate-gateway-dockerfile';

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

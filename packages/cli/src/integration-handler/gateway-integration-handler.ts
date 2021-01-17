import { DockerIntegrationHandler } from './docker-integration-handler';
import { Context, DockerCompose, IntegrationContextBase } from '../types';
import path from 'path';
import fs from 'fs';

export class GatewayIntegrationHandler extends DockerIntegrationHandler {
    generateDockerCompose(context: Context, integration: IntegrationContextBase): DockerCompose {
        const dockerFilePath = path.resolve(context.directories.build, 'Dockerfile-gateway');

        GatewayIntegrationHandler.generateDockerfile(context, dockerFilePath);

        const dockerCompose: DockerCompose = {
            version: '3.8',
            services: {
                [integration.name]: {
                    build: {
                        context: process.cwd(),
                        dockerfile: dockerFilePath
                    },
                    ports: [`${context.config.gateway.host}:${context.config.gateway.port}:80`],
                    volumes: [{ type: 'bind', source: process.cwd(), target: '/local-api-gateway' }]
                }
            }
        };

        if (context.config.gateway.source) {
            dockerCompose.services[integration.name].volumes!.push({
                type: 'bind',
                source: context.config.gateway.source,
                target: '/app'
            });
        }

        return dockerCompose;
    }

    private static generateDockerfile(context: Context, filename: string): void {
        const commands = [
            'FROM node:14',
            'EXPOSE 80',
            'WORKDIR /app',
            // install the gateway if we haven't provided a path to it
            context.config.gateway.source ? '' : 'RUN npm install -g @local-api-gateway/gateway',
            'ENV PATH="/app/node_modules/.bin:${PATH}"', // eslint-disable-line no-template-curly-in-string
            context.config.gateway.source ? 'ENTRYPOINT ["npm", "run", "start"]' : 'ENTRYPOINT ["local-api-gateway"]'
        ];

        fs.writeFileSync(filename, commands.join('\n'));
    }
}

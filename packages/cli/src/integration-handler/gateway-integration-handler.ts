import { Context, DockerCompose, GatewayIntegrationContext, IntegrationHandler } from '../types';

export class GatewayIntegrationHandler implements IntegrationHandler {
    generateDockerCompose(context: Context, integration: GatewayIntegrationContext): DockerCompose {
        const dockerCompose: DockerCompose = {
            version: '3.8',
            services: {
                [integration.name]: {
                    build: {
                        context: process.cwd(),
                        dockerfile: context.files.gatewayDockerfile
                    },
                    ports: [`${context.config.gateway.host}:${context.config.gateway.port}:80`],
                    volumes: [{ type: 'bind', source: process.cwd(), target: '/local-api-gateway' }],
                    restart: 'always'
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
}

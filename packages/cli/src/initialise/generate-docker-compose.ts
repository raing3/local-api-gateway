import { Context, DockerCompose, IntegrationContext } from '../types';
import { getIntegrationHandler } from '../integration-handler';
import path from 'path';
import compareVersions from 'compare-versions';
import { Dictionary } from '@local-api-gateway/types/src';
import { clone } from '@local-api-gateway/utils';
import { resolveNewServiceName } from '../utils/resolve-new-service-name';

const resolvePaths = (dockerCompose: DockerCompose, integration: IntegrationContext, buildPath: string) => {
    const resolvePath = (...pathSegments: string[]): string => {
        if ('config' in integration && integration.config.context) {
            pathSegments.unshift(integration.config.context);
        }

        return path.relative(buildPath, path.resolve(integration.destination, ...pathSegments)) || '.';
    };

    Object.values(dockerCompose.services).forEach(service => {
        if (typeof service.build === 'string') {
            service.build = resolvePath(service.build);
        } else if (service.build?.context) {
            service.build.context = resolvePath(service.build.context);
        }

        if (service.volumes) {
            Object.values(service.volumes).forEach(volume => {
                volume.source = resolvePath(volume.source);
            });
        }
    });
};

const mergeDockerComposes = (context: Context): DockerCompose => {
    const merged = {
        version: '3.8',
        services: {}
    };

    Object.values(context.integrations).forEach(integration => {
        const dockerCompose = clone(integration.dockerCompose!);

        // use the latest version from all schemas, lets hope for no BC breaks.
        if (compareVersions(merged.version, dockerCompose.version) < 0) {
            merged.version = dockerCompose.version;
        }

        if (integration.type !== 'gateway') {
            Object.values(dockerCompose.services).forEach(service => {
                delete service.ports;
            });
        }

        merged.services = {
            ...merged.services,
            ...dockerCompose.services
        };
    });

    return merged;
};

const fixLinks = (context: Context) => {
    Object.values(context.integrations).forEach(integration => {
        const dockerCompose = integration.dockerCompose!;

        Object.values(dockerCompose.services).forEach(service => {
            if (service.links) {
                // fix any existing links
                service.links = service.links.map(link => {
                    const [originalServiceName, alias] = link.split(':');

                    return originalServiceName && alias
                        ? `${resolveNewServiceName(integration, originalServiceName)}:${alias}`
                        : `${link}`;
                });
            }
        });
    });
};

const renameServices = (context: Context) => {
    const usedServiceNames: Dictionary<number> = {};

    Object.values(context.integrations).forEach(integration => {
        const dockerCompose = integration.dockerCompose!;
        const serviceNames = Object.keys(dockerCompose.services);

        serviceNames.forEach(originalServiceName => {
            // generate new name for service, use integration name as preference, avoid collisions
            let serviceName = serviceNames.length === 1
                ? integration.name
                : `${integration.name}.${originalServiceName}`;

            if (serviceName in usedServiceNames) {
                serviceName += `-${++usedServiceNames[serviceName]}`;
            } else {
                usedServiceNames[serviceName] = 1;
            }

            // track the old and new service name
            integration.services[serviceName] = {
                originalServiceName: originalServiceName
            };

            // re-add the service under its new neame
            if (serviceName !== originalServiceName) {
                dockerCompose.services[serviceName] = integration.dockerCompose!.services[originalServiceName];
                delete dockerCompose.services[originalServiceName];
            }
        });
    });
};

const populateInitialDockerCompose = (context: Context) => {
    Object.values(context.integrations).forEach(integration => {
        integration.dockerCompose = getIntegrationHandler(integration).generateDockerCompose(context, integration);

        resolvePaths(integration.dockerCompose, integration, context.directories.build);
    });
};

export const generateDockerCompose = (context: Context): DockerCompose => {
    populateInitialDockerCompose(context);
    renameServices(context);
    fixLinks(context);

    return mergeDockerComposes(context);
};

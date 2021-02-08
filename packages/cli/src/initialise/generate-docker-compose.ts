import {
    Context,
    DockerCompose,
    DockerComposeService,
    DockerComposeServiceNetwork,
    IntegrationContext
} from '../types';
import { Dictionary } from '@local-api-gateway/types';
import { getIntegrationHandler } from '../integration-handler';
import path from 'path';
import compareVersions from 'compare-versions';
import { clone } from '@local-api-gateway/utils';
import { resolveNewNetworkName } from '../utils/resolve-new-network-name';
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
        services: {},
        networks: {}
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

        merged.networks = {
            ...merged.networks,
            ...dockerCompose.networks
        };
    });

    return merged;
};

const renameServices = (context: Context) => {
    Object.values(context.integrations).forEach(integration => {
        const dockerCompose = integration.dockerCompose!;
        const serviceNames = Object.keys(dockerCompose.services);

        serviceNames.forEach(originalServiceName => {
            // generate new name for service, use integration name as preference, avoid collisions
            const serviceName = serviceNames.length === 1 ?
                integration.name :
                `${integration.name}.${originalServiceName}`;

            // track the old and new service name
            integration.services[serviceName] = {
                originalServiceName: originalServiceName
            };

            // re-add the service under its new name
            if (serviceName !== originalServiceName) {
                dockerCompose.services[serviceName] = integration.dockerCompose!.services[originalServiceName];
                delete dockerCompose.services[originalServiceName];
            }
        });
    });
};

const renameNetworks = (context: Context) => {
    Object.values(context.integrations).forEach(integration => {
        if (!integration.dockerCompose?.networks) {
            return;
        }

        const dockerCompose = integration.dockerCompose!;
        const networkNames = Object.keys(dockerCompose.networks!);

        networkNames.forEach(originalNetworkName => {
            // generate new name for service, use integration name as preference, avoid collisions
            const networkName = `${integration.name}.${originalNetworkName}`;

            // track the old and new service name
            integration.networks[networkName] = {
                originalNetworkName: originalNetworkName
            };

            // re-add the network under its new name
            dockerCompose.networks![networkName] = dockerCompose.networks![originalNetworkName];
            delete dockerCompose.networks![originalNetworkName];
        });
    });
};

const fixLinks = (context: Context) => {
    Object.values(context.integrations).forEach(integration => {
        const dockerCompose = integration.dockerCompose!;

        Object.values(dockerCompose.services).forEach(service => {
            if (service.links) {
                // fix any existing links
                service.links = service.links.map(link => {
                    const [originalServiceName, alias] = link.split(':');

                    return originalServiceName && alias ?
                        `${resolveNewServiceName(integration, originalServiceName)}:${alias}` :
                        `${link}`;
                });
            }
        });
    });
};

const fixNetworkNamesAndAliases = (context: Context) => {
    Object.values(context.integrations).forEach(integration => {
        const dockerCompose = integration.dockerCompose!;

        Object.entries(dockerCompose.services).forEach(([serviceName, service]) => {
            const networks: Dictionary<DockerComposeServiceNetwork> = {};

            if (service.networks instanceof Array) {
                // networks is an array of network names
                // change to new network name and add alias for original service name
                service.networks.forEach(network => {
                    networks[resolveNewNetworkName(integration, network)] = {
                        aliases: [integration.services[serviceName].originalServiceName]
                    };
                });
            } else if (service.networks) {
                // networks is an dictionary of network options, indexed by network name
                // change to new network name and add alias for original service name
                Object.entries(service.networks).forEach(([originalNetworkName, options]) => {
                    networks[resolveNewNetworkName(integration, originalNetworkName)] = {
                        ...options,
                        aliases: [
                            integration.services[serviceName].originalServiceName,
                            ...options.aliases || []
                        ]
                    };
                });
            } else {
                return;
            }

            service.networks = networks;
        });
    });
};

const createDefaultNetworks = (context: Context) => {
    Object.values(context.integrations).forEach(integration => {
        const dockerCompose = integration.dockerCompose!;
        const servicesMissingNetworks: Dictionary<DockerComposeService> = {};

        Object.entries(dockerCompose.services).forEach(([serviceName, service]) => {
            if (!service.networks) {
                servicesMissingNetworks[serviceName] = service;
            }
        });

        // if a service contains 2+ container that don't have networks define they are part of the "default" network.
        // need to create an isolated "default" network and add containers without defined networks to it.
        if (Object.values(servicesMissingNetworks).length >= 2) {
            const defaultNetworkName = `${integration.name}.default`;

            // create default network
            integration.dockerCompose!.networks = {
                [defaultNetworkName]: {
                    driver: 'bridge'
                },
                ...integration.dockerCompose!.networks
            };

            // add services that don't have a network defined to the default network with the original service name.
            Object.entries(servicesMissingNetworks).forEach(([serviceName, service]) => {
                service.networks = {
                    [defaultNetworkName]: {
                        aliases: [integration.services[serviceName].originalServiceName]
                    }
                };
            });
        }
    });
};

const createGatewayNetworks = (context: Context) => {
    // each service which exposes a route needs to be added to its own gateway network to allow
    // the gateway to communicate with it.

    Object.values(context.integrations).forEach(integration => {
        const servicesInGatewayNetwork: Set<string> = new Set([]);

        if ('config' in integration) {
            integration.config.routes.forEach(route => {
                servicesInGatewayNetwork.add(
                    // if no service name is specified it is pointing to the first service in docker-compose.yml.
                    route.service ?
                        resolveNewServiceName(integration, route.service) :
                        Object.keys(integration.services)[0]
                );
            });
        }

        if (servicesInGatewayNetwork.size > 0) {
            servicesInGatewayNetwork.forEach(serviceName => {
                const gatewayNetworkName = `${serviceName}.gateway`;

                // create gateway network
                integration.dockerCompose!.networks = {
                    [gatewayNetworkName]: {
                        driver: 'bridge'
                    },
                    ...integration.dockerCompose!.networks
                };

                // add service to network
                integration.dockerCompose!.services[serviceName].networks = {
                    ...integration.dockerCompose!.services[serviceName].networks,
                    [gatewayNetworkName]: {}
                };

                // add gateway to network
                Object.values(context.gateway.dockerCompose!.services)[0].networks = {
                    ...Object.values(context.gateway.dockerCompose!.services)[0].networks,
                    [gatewayNetworkName]: {}
                };
            });
        }
    });

    Object.values(context.integrations).forEach(integration => {
        const dockerCompose = integration.dockerCompose!;
        const servicesMissingNetworks: Dictionary<DockerComposeService> = {};

        Object.entries(dockerCompose.services).forEach(([serviceName, service]) => {
            if (!service.networks) {
                servicesMissingNetworks[serviceName] = service;
            }
        });

        // if a service contains 2+ container that don't have networks define they are part of the "default" network.
        // need to create an isolated "default" network and add containers without defined networks to it.
        if (Object.values(servicesMissingNetworks).length >= 2) {
            const defaultNetworkName = `${integration.name}.default`;

            // create default network
            integration.dockerCompose!.networks = {
                [defaultNetworkName]: {
                    driver: 'bridge'
                },
                ...integration.dockerCompose!.networks
            };

            // add services that don't have a network defined to the default network with the original service name.
            Object.entries(servicesMissingNetworks).forEach(([serviceName, service]) => {
                service.networks = {
                    [defaultNetworkName]: {
                        aliases: [integration.services[serviceName].originalServiceName]
                    }
                };
            });
        }
    });
};

const fixDependsOn = (context: Context) => {
    Object.values(context.integrations).forEach(integration => {
        const dockerCompose = integration.dockerCompose!;

        Object.values(dockerCompose.services).forEach(service => {
            if (service.depends_on) {
                service.depends_on = service.depends_on.map(
                    dependency => resolveNewServiceName(integration, dependency)
                );
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
    renameNetworks(context);
    fixLinks(context);
    fixNetworkNamesAndAliases(context);
    createDefaultNetworks(context);
    createGatewayNetworks(context);
    fixDependsOn(context);

    return mergeDockerComposes(context);
};

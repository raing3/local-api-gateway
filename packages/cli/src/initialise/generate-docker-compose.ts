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
import { resolveOriginalServiceName } from '../utils/resolve-original-service-name';
import { toSnakeCase } from '../utils/to-snake-case';

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
            service.volumes = service.volumes.map(volume => {
                if (typeof volume === 'string' && volume.match(/^\..*?:/)) {
                    // Short syntax, path on the host, relative to the compose file
                    // https://docs.docker.com/compose/compose-file/compose-file-v3/#short-syntax-3
                    const parts = volume.split(':');

                    parts[0] = resolvePath(parts[0]);
                    volume = parts.join(':');
                } else if (typeof volume === 'object') {
                    // Long syntax
                    // https://docs.docker.com/compose/compose-file/compose-file-v3/#long-syntax-3
                    volume.source = resolvePath(volume.source);
                }

                return volume;
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

const deletePorts = (context: Context) => {
    Object.values(context.integrations).forEach(integration => {
        if (integration.type !== 'gateway') {
            Object.values(integration.dockerCompose!.services).forEach(service => {
                delete service.ports;
            });
        }
    });
};

const renameServices = (context: Context) => {
    Object.values(context.integrations).forEach(integration => {
        const dockerCompose = integration.dockerCompose!;
        const serviceNames = Object.keys(dockerCompose.services);

        serviceNames.forEach(originalServiceName => {
            if (!('config' in integration)) {
                return;
            }

            const serviceName = resolveNewServiceName(integration, originalServiceName);

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
            const networkName = resolveNewNetworkName(integration, originalNetworkName);

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
                        aliases: [resolveOriginalServiceName(integration, serviceName)]
                    };
                });
            } else if (service.networks) {
                // networks is an dictionary of network options, indexed by network name
                // change to new network name and add alias for original service name
                Object.entries(service.networks).forEach(([originalNetworkName, options]) => {
                    networks[resolveNewNetworkName(integration, originalNetworkName)] = {
                        ...options,
                        aliases: [
                            resolveOriginalServiceName(integration, serviceName),
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
                        aliases: [resolveOriginalServiceName(integration, serviceName)]
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
            Object.values(integration.config.services).forEach(service => {
                if (service.routes.length > 0) {
                    servicesInGatewayNetwork.add(service.name);
                }
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
                        aliases: [resolveOriginalServiceName(integration, serviceName)]
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

const addLabels = (context: Context) => {
    Object.values(context.integrations).forEach(integration => {
        const dockerCompose = integration.dockerCompose!;

        if (integration.type === 'gateway') {
            return;
        }

        Object.entries(dockerCompose.services).forEach(([serviceName, service]) => {
            service.labels = {
                ...service.labels || {},
                'com.local-api-gateway.integration_name': integration.name, // eslint-disable-line
                'com.local-api-gateway.original_service_name': resolveOriginalServiceName(integration, serviceName) // eslint-disable-line
            };
        });
    });
};

const injectIntegrationConfiguration = (context: Context, dockerCompose: DockerCompose): DockerCompose => {
    Object.values(context.integrations).forEach(integration => {
        if ('config' in integration) {
            Object.values(integration.config.services).forEach(service => {
                if (service.ports.length > 0) {
                    dockerCompose.services[service.name].ports = [
                        ...integration.dockerCompose!.services[service.name].ports || [],
                        ...service.ports
                    ];
                }

                if (Object.keys(service.networks).length > 0) {
                    const networks = dockerCompose.services[service.name].networks || {};

                    if (networks instanceof Array) {
                        throw new Error(`Cannot configure networks on service "${service.name}".`);
                    }

                    Object.entries(service.networks).forEach(([originalNetworkName, network]) => {
                        const networkName = `${context.config.name}.${originalNetworkName}`;

                        networks[networkName] = network;
                    });

                    dockerCompose.services[service.name].networks = networks;
                }
            });
        }
    });

    Object.entries(context.config.networks).forEach(([networkName, network]) => {
        networkName = `${context.config.name}.${networkName}`;

        dockerCompose.networks![networkName] = network;
    });

    Object.values(dockerCompose.services).forEach(service => {
        service.extra_hosts = [
            ...service.extra_hosts || [],
            ...context.config.extraHosts
        ];
    });

    return dockerCompose;
};

const populateConfig = (context: Context) => {
    Object.entries(context.integrations).forEach(([integrationName, integration]) => {
        if (!('config' in integration)) {
            return;
        }

        const numServices = Object.keys(integration.dockerCompose!.services).length;

        // add services which are only defined in docker-compose.yml.
        // rename "_default" service to its actual name.
        Object.keys(integration.dockerCompose!.services).forEach(serviceName => {
            if (integration.config.services._default) { // eslint-disable-line
                integration.config.services[serviceName] = integration.config.services._default;
                delete integration.config.services._default;
            } else if (!integration.config.services[serviceName]) { // eslint-disable-line
                integration.config.services[serviceName] = {
                    name: serviceName,
                    ports: [],
                    networks: {},
                    routes: []
                };
            }

            // Docker has issues with uppercase characters in service names, convert to snake case.
            // https://github.com/docker/compose/issues/1416
            integration.config.services[serviceName].name = toSnakeCase(
                numServices === 1 ?
                    integrationName :
                    `${integrationName}.${serviceName}`
            );
        });

        // make sure all configured services exist.
        Object.keys(integration.config.services).forEach(serviceName => {
            if (!integration.dockerCompose!.services[serviceName]) { // eslint-disable-line
                throw new Error(`Service "${serviceName}" does not exist in integration "${integrationName}".`);
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
    populateConfig(context);
    deletePorts(context);
    renameServices(context);
    renameNetworks(context);
    fixLinks(context);
    fixNetworkNamesAndAliases(context);
    createDefaultNetworks(context);
    createGatewayNetworks(context);
    fixDependsOn(context);
    addLabels(context);

    return injectIntegrationConfiguration(context, mergeDockerComposes(context));
};

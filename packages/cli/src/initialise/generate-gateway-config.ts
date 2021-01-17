import { Context } from '../types';
import { clone } from '@local-api-gateway/utils';
import { resolveNewServiceName } from '../utils/resolve-new-service-name';
import { Config } from '@local-api-gateway/types/src';

export const generateGatewayConfig = (context: Context): Config => {
    const config = clone(context.config);

    Object.keys(config.integrations).forEach(integrationName => {
        const integration = context.integrations[integrationName];
        const integrationConfig = config.integrations[integrationName];

        integrationConfig.routes.forEach(route => {
            route.service = route.service
                // service name specified, resolve it to what it has been renamed to
                ? resolveNewServiceName(context.integrations[integrationName], route.service)
                // no service name specified, just resolve it to the first service
                : Object.keys(integration.services)[0];
        });
    });

    return config;
};

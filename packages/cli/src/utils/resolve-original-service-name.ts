import { IntegrationContext } from '../types';

export const resolveOriginalServiceName = (integration: IntegrationContext, newServiceName: string): string => {
    const result = 'config' in integration ?
        Object.keys(integration.config.services).find(originalServiceName => {
            return integration.config.services[originalServiceName].name === newServiceName;
        }) :
        null;

    if (!result) {
        throw new Error(
            `Cannot find service named "${newServiceName}" for integration "${integration.name}"`
        );
    }

    return result;
};

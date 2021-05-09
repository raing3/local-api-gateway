import { IntegrationContext } from '../types';

export const resolveNewServiceName = (integration: IntegrationContext, originalServiceName: string): string => {
    const result = 'config' in integration ?
        integration.config.services[originalServiceName].name :
        null;

    if (!result) {
        throw new Error(
            `Cannot find service originally named "${originalServiceName}" for integration "${integration.name}"`
        );
    }

    return result;
};

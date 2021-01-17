import { IntegrationContext } from '../types';

export const resolveNewServiceName = (integration: IntegrationContext, originalServiceName: string): string => {
    const result = Object.entries(integration.services).find((entry) => {
        return entry[1].originalServiceName === originalServiceName;
    });

    if (!result) {
        throw new Error(
            `Cannot find service originally named "${originalServiceName}" for integration "${integration.name}"`
        );
    }

    return result[0];
};

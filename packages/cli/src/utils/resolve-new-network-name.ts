import { IntegrationContext } from '../types';

export const resolveNewNetworkName = (integration: IntegrationContext, originalNetworkName: string): string => {
    const result = Object.entries(integration.networks).find((entry) => {
        return entry[1].originalNetworkName === originalNetworkName;
    });

    if (!result) {
        throw new Error(
            `Cannot find network originally named "${originalNetworkName}" for integration "${integration.name}"`
        );
    }

    return result[0];
};

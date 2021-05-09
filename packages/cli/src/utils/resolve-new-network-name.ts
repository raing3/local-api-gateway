import { IntegrationContext } from '../types';

export const resolveNewNetworkName = (integration: IntegrationContext, originalNetworkName: string): string => {
    return `${integration.name}.${originalNetworkName}`;
};

import { Context } from '../types';
import { initialiseBuildDirectory } from './initialise-build-directory';
import { checkoutIntegrations } from './checkout-integrations';

export const initialise = async (context: Context): Promise<void> => {
    await checkoutIntegrations(context);
    initialiseBuildDirectory(context);
};

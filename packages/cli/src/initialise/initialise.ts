import { checkoutIntegrations } from './checkout-integrations';
import { Context } from '../types';
import { initialiseBuildDirectory } from './initialise-build-directory';

export const initialise = async (context: Context): Promise<void> => {
    await checkoutIntegrations(context);
    initialiseBuildDirectory(context);
};

import execa from 'execa';
import { Context } from '../types';
import fs from 'fs';
import chalk from 'chalk';

export const checkoutIntegrations = async (context: Context): Promise<void> => {
    for (const integrationName in context.integrations) {
        const integration = context.integrations[integrationName];

        if (!('config' in integration) || integration.config.source.type !== 'vcs') {
            continue;
        }

        if (!fs.existsSync(integration.destination)) {
            fs.mkdirSync(integration.destination);
        }

        if (fs.readdirSync(integration.destination).length !== 0) {
            continue;
        }

        console.log('Checkout out:', chalk.black.bgWhite(integration.config.source.url));

        await execa(
            'git',
            ['clone', integration.config.source.url, '.'],
            { stdio: 'inherit', cwd: integration.destination }
        );

        console.log('Building:', chalk.black.bgWhite(integration.config.source.url));

        for (const index in integration.config.build) {
            const command = integration.config.build[index];

            console.log('Executing:', chalk.black.bgWhite(command));
            await execa(command, { shell: true, stdio: 'inherit', cwd: integration.destination });
        }
    }
};

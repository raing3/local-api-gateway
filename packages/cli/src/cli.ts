#!/usr/bin/env node

import program from 'commander';
import compareVersions from 'compare-versions';
import { createContext } from './utils/create-context';
import { initialise } from './initialise';
import execa from 'execa';
import chalk from 'chalk';
import { getVersion } from './utils/get-version';
import { getDockerComposeVersion } from './utils/get-docker-compose-version';

const context = createContext('local-api-gateway.yml');
const minDockerComposeVersion = '1.25.5';

const dockerComposePassthrough = async (args: string[]) => {
    try {
        const command = `docker-compose ${args.join(' ')}`;

        console.log('Executing command:', chalk.black.bgWhite(command));
        await execa(command, { shell: true, stdio: 'inherit', cwd: context.directories.build });
    } catch (error) {
        console.log(error.message);
    }
};

program
    .command('ssh [service]')
    .action(async (service: string) => {
        await dockerComposePassthrough([`exec "${service}" /bin/sh`]);
    });

program
    .allowUnknownOption(true)
    .on('command:*', async () => {
        const command = program.args[0];
        const args = [...program.args];
        const dockerComposeVersion = await getDockerComposeVersion();

        console.log('Local API gateway version ', chalk.black.bgWhite(getVersion()));
        console.log('Docker compose version ', chalk.black.bgWhite(dockerComposeVersion || 'unknown'));

        if (!dockerComposeVersion || compareVersions(dockerComposeVersion, minDockerComposeVersion) < 0) {
            console.log(chalk.bgRed(
                `This tool requires docker-compose ${minDockerComposeVersion} or higher to be installed.`
            ));
        }

        if (['up', 'build'].includes(command)) {
            await initialise(context);
            args.unshift(`-f ${context.files.dockerCompose}`);
        }

        await dockerComposePassthrough(args);
    });

if (process.argv.length > 2) {
    program.parse(process.argv);
} else {
    program.help();
}

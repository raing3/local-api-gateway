#!/usr/bin/env node

import program from 'commander';
import compareVersions from 'compare-versions';
import { createContext } from './utils/create-context';
import { initialise } from './initialise';
import execa from 'execa';
import fs from 'fs';
import chalk from 'chalk';
import { getVersion } from './utils/get-version';
import { getDockerComposeVersion } from './utils/get-docker-compose-version';
import { formatLintResults, lint } from './linter/lint';
import path from 'path';
import { getContainerIds } from './utils/get-container-id';

const minDockerComposeVersion = '1.25.5';
const context = createContext('local-api-gateway.yml');

const passthrough = async (executable: string, args: string[]) => {
    try {
        const command = `${executable} ${args.join(' ')}`;

        console.log('Executing command:', chalk.black.bgWhite(command));
        await execa(command, { shell: true, stdio: 'inherit', cwd: context.directories.build });
    } catch (error) {
        console.log(error.message);
    }
};

program
    .command('lint')
    .action(async () => {
        try {
            const rulesetPath = path.join(process.cwd(), '/local-api-gateway.lint.yml');
            const results = await lint({
                configurationPath: path.join(process.cwd(), '/local-api-gateway.yml'),
                rulesetPath: fs.existsSync(rulesetPath) ? rulesetPath : undefined
            });

            if (results.length > 0) {
                console.log(formatLintResults(results));
                process.exit(1); // eslint-disable-line no-process-exit
            } else {
                console.log('No linting issues were found!');
            }
        } catch (error) {
            console.log(error.message);
        }
    });

program
    .command('ssh [service]')
    .action(async (service: string) => {
        const [integrationName, serviceName] = service.split('.');
        const filters = [`label=com.local-api-gateway.integration_name=${integrationName}`];

        if (serviceName) {
            filters.push(`label=com.local-api-gateway.original_service_name=${serviceName}`);
        }

        const containerIds = await getContainerIds(filters);

        if (containerIds.length === 0) {
            throw new Error(`"${service}" is an invalid service name.`);
        }

        await passthrough('docker', [`exec -it "${containerIds[0]}" /bin/sh`]);
    });

program
    .allowUnknownOption(true)
    .on('command:*', async () => {
        const command = program.args[0];
        const args = [...program.args];
        const dockerComposeVersion = await getDockerComposeVersion();
        const noBuildConfigIndex = args.indexOf('--no-build-config');

        console.log('Local API gateway version ', chalk.black.bgWhite(getVersion()));
        console.log('Docker compose version ', chalk.black.bgWhite(dockerComposeVersion || 'unknown'));

        if (!dockerComposeVersion || compareVersions(dockerComposeVersion, minDockerComposeVersion) < 0) {
            console.log(chalk.bgRed(
                `This tool requires docker-compose ${minDockerComposeVersion} or higher to be installed.`
            ));
        }

        if (['up', 'build'].includes(command)) {
            if (noBuildConfigIndex >= 0) {
                args.splice(noBuildConfigIndex, 1);
                console.log(chalk.black.bgYellow('Skipping rebuild of configuration.'));
            } else {
                await initialise(context);
            }

            args.unshift(`-f ${context.files.dockerCompose}`);
        }

        await passthrough('docker-compose', args);
    });

if (process.argv.length > 2) {
    program.parse(process.argv);
} else {
    program.help();
}

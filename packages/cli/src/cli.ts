#!/usr/bin/env node

/* eslint-disable no-console */
import program from 'commander';
import { createContext } from './utils/create-context';
import { initialise } from './initialise';
import execa from 'execa';
import chalk from 'chalk';

const context = createContext('local-api-gateway.yml');

const dockerComposePassthrough = async (args: string[]) => {
    try {
        const command = `sudo docker-compose ${args.join(' ')}`;

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

        if (command === 'up') {
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

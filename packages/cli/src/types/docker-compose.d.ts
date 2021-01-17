/* eslint-disable @typescript-eslint/naming-convention */
import { Dictionary } from '@local-api-gateway/types/src';

export type DockerCompose = {
    version: string;
    services: Dictionary<{
        image?: string;
        build?: string|{
            context: string;
            dockerfile?: string;
            args?: Dictionary<any>;
        }
        working_dir?: string;
        command?: string;
        ports?: string[];
        volumes?: {
            type: 'bind',
            source: string;
            target: string;
        }[];
        links?: string[];
    }>;
};

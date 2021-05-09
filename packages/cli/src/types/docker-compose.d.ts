/* eslint-disable @typescript-eslint/naming-convention */
import { Dictionary } from '@local-api-gateway/types';

export type DockerComposeServiceBuild = string|{
    context: string;
    dockerfile?: string;
    args?: Dictionary<any>;
};

export type DockerComposeServiceVolume = string|{
    type: 'bind',
    source: string;
    target: string;
};

export type DockerComposeServiceNetwork = {
    aliases?: string[];
    ipv4_address?: string;
    ipv6_address?: string;
};

export type DockerComposeService = {
    image?: string;
    build?: string|DockerComposeServiceBuild;
    working_dir?: string;
    command?: string;
    ports?: string[];
    volumes?: DockerComposeServiceVolume[];
    links?: string[];
    restart?: 'no'|'always'|'on-failure'|'unless-stopped';
    networks?: string[]|Dictionary<DockerComposeServiceNetwork>;
    depends_on?: string[];
    extra_hosts?: string[];
};

export type DockerComposeNetwork = {
    name?: string;
    driver?: string;
    external?: boolean;
    attachable?: boolean;
    config?: any;
};

export type DockerCompose = {
    version: string;
    services: Dictionary<DockerComposeService>;
    networks?: Dictionary<DockerComposeNetwork>;
};

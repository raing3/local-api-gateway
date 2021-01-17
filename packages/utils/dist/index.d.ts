import { Config } from '@local-api-gateway/types';
export declare const resolveUriLocalPath: (uri: string) => string;
export declare const parseConfig: (configPath: string) => Config;
export declare const clone: <T>(value: T) => T;

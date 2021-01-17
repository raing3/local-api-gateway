"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = void 0;
var path_1 = __importDefault(require("path"));
var utils_1 = require("@local-api-gateway/utils");
exports.createContext = function (configPath) {
    var config = utils_1.parseConfig(configPath);
    var buildDirectory = path_1.default.resolve(configPath, '..', '.local-api-gateway');
    var context = {
        config: config,
        network: {
            name: config.name
        },
        gateway: {
            name: 'gateway',
            type: 'gateway',
            destination: process.cwd(),
            services: {}
        },
        integrations: {},
        directories: {
            build: buildDirectory
        },
        files: {
            config: path_1.default.resolve(configPath),
            dockerCompose: path_1.default.resolve(buildDirectory, 'docker-compose.yml')
        }
    };
    context.integrations[context.gateway.name] = context.gateway;
    Object.keys(config.integrations).forEach(function (integrationName) {
        var integrationConfig = config.integrations[integrationName];
        context.integrations[integrationName] = {
            name: integrationName,
            type: integrationConfig.type,
            destination: integrationConfig.destination,
            services: {},
            config: integrationConfig
        };
    });
    return context;
};

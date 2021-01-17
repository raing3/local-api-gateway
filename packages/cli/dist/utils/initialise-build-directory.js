"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialiseBuildDirectory = void 0;
var generate_docker_compose_1 = require("./generate-docker-compose");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var yaml_1 = __importDefault(require("yaml"));
var generate_gateway_config_1 = require("./generate-gateway-config");
exports.initialiseBuildDirectory = function (context) {
    if (!fs_1.default.existsSync(context.directories.build)) {
        fs_1.default.mkdirSync(context.directories.build);
    }
    var buildDirectory = context.directories.build;
    var dockerCompose = generate_docker_compose_1.generateDockerCompose(context);
    var gatewayConfig = generate_gateway_config_1.generateGatewayConfig(context);
    fs_1.default.writeFileSync(path_1.default.resolve(buildDirectory, 'docker-compose.yml'), yaml_1.default.stringify(dockerCompose));
    fs_1.default.writeFileSync(path_1.default.resolve(buildDirectory, 'config.gateway.yml'), yaml_1.default.stringify(gatewayConfig));
};

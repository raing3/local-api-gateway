"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerComposeIntegrationHandler = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var yaml_1 = __importDefault(require("yaml"));
var DockerComposeIntegrationHandler = (function () {
    function DockerComposeIntegrationHandler() {
    }
    DockerComposeIntegrationHandler.prototype.generateDockerCompose = function (context, integration) {
        var dockerCompose = fs_1.default.readFileSync(path_1.default.resolve(integration.destination, 'docker-compose.yml'), 'utf8');
        return yaml_1.default.parse(dockerCompose);
    };
    return DockerComposeIntegrationHandler;
}());
exports.DockerComposeIntegrationHandler = DockerComposeIntegrationHandler;

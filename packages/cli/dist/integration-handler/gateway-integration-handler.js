"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayIntegrationHandler = void 0;
var docker_integration_handler_1 = require("./docker-integration-handler");
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var GatewayIntegrationHandler = (function (_super) {
    __extends(GatewayIntegrationHandler, _super);
    function GatewayIntegrationHandler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GatewayIntegrationHandler.prototype.generateDockerCompose = function (context, integration) {
        var _a;
        var dockerFilePath = path_1.default.resolve(context.directories.build, 'Dockerfile-gateway');
        GatewayIntegrationHandler.generateDockerfile(context, dockerFilePath);
        var dockerCompose = {
            version: '3.8',
            services: (_a = {},
                _a[integration.name] = {
                    build: {
                        context: process.cwd(),
                        dockerfile: dockerFilePath
                    },
                    ports: ['80:80'],
                    volumes: [{ type: 'bind', source: process.cwd(), target: '/local-api-gateway' }]
                },
                _a)
        };
        if (context.config.gateway.source) {
            dockerCompose.services[integration.name].volumes.push({
                type: 'bind',
                source: context.config.gateway.source,
                target: '/app'
            });
        }
        return dockerCompose;
    };
    GatewayIntegrationHandler.generateDockerfile = function (context, filename) {
        var commands = [
            'FROM node:14',
            'EXPOSE 80',
            'WORKDIR /app',
            context.config.gateway.source ? '' : 'npm install -g @local-api-gateway/gateway',
            'ENV PATH="/app/node_modules/.bin:${PATH}"',
            context.config.gateway.source ? 'ENTRYPOINT ["npm", "run", "start"]' : 'ENTRYPOINT ["local-api-gateway"]'
        ];
        fs_1.default.writeFileSync(filename, commands.join('\n'));
    };
    return GatewayIntegrationHandler;
}(docker_integration_handler_1.DockerIntegrationHandler));
exports.GatewayIntegrationHandler = GatewayIntegrationHandler;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIntegrationHandler = void 0;
var docker_integration_handler_1 = require("./docker-integration-handler");
var gateway_integration_handler_1 = require("./gateway-integration-handler");
var docker_compose_integration_handler_1 = require("./docker-compose-integration-handler");
var handlers = {
    docker: new docker_integration_handler_1.DockerIntegrationHandler(),
    gateway: new gateway_integration_handler_1.GatewayIntegrationHandler(),
    'docker-compose': new docker_compose_integration_handler_1.DockerComposeIntegrationHandler()
};
exports.getIntegrationHandler = function (integration) {
    var type = integration.type;
    if (type in handlers) {
        return handlers[type];
    }
    throw new Error("Unknown integration type \"" + type + "\" for \"" + integration.name + "\", cannot start.");
};

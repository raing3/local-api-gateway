"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGatewayConfig = void 0;
var utils_1 = require("@local-api-gateway/utils");
var resolve_new_service_name_1 = require("./resolve-new-service-name");
exports.generateGatewayConfig = function (context) {
    var config = utils_1.clone(context.config);
    Object.keys(config.integrations).forEach(function (integrationName) {
        var integration = context.integrations[integrationName];
        var integrationConfig = config.integrations[integrationName];
        integrationConfig.routes.forEach(function (route) {
            route.service = route.service
                ? resolve_new_service_name_1.resolveNewServiceName(context.integrations[integrationName], route.service)
                : Object.keys(integration.services)[0];
        });
    });
    return config;
};

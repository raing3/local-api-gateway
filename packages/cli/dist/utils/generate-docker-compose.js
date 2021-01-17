"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDockerCompose = void 0;
var integration_handler_1 = require("../integration-handler");
var path_1 = __importDefault(require("path"));
var compare_versions_1 = __importDefault(require("compare-versions"));
var utils_1 = require("@local-api-gateway/utils");
var resolve_new_service_name_1 = require("./resolve-new-service-name");
var resolvePaths = function (dockerCompose, integration, buildPath) {
    var resolvePath = function () {
        var pathSegments = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            pathSegments[_i] = arguments[_i];
        }
        return path_1.default.relative(buildPath, path_1.default.resolve.apply(path_1.default, __spreadArrays([integration.destination], pathSegments))) || '.';
    };
    Object.values(dockerCompose.services).forEach(function (service) {
        var _a;
        if (typeof service.build === 'string') {
            service.build = resolvePath(service.build);
        }
        else if ((_a = service.build) === null || _a === void 0 ? void 0 : _a.context) {
            service.build.context = resolvePath(service.build.context);
        }
        if (service.volumes) {
            Object.values(service.volumes).forEach(function (volume) {
                volume.source = resolvePath(volume.source);
            });
        }
    });
};
var mergeDockerComposes = function (context) {
    var merged = {
        version: '3.8',
        services: {}
    };
    Object.values(context.integrations).forEach(function (integration) {
        var dockerCompose = utils_1.clone(integration.dockerCompose);
        if (compare_versions_1.default(merged.version, dockerCompose.version) < 0) {
            merged.version = dockerCompose.version;
        }
        if (integration.type !== 'gateway') {
            Object.values(dockerCompose.services).forEach(function (service) {
                delete service.ports;
            });
        }
        merged.services = __assign(__assign({}, merged.services), dockerCompose.services);
    });
    return merged;
};
var fixLinks = function (context) {
    Object.values(context.integrations).forEach(function (integration) {
        var dockerCompose = integration.dockerCompose;
        Object.values(dockerCompose.services).forEach(function (service) {
            if (service.links) {
                service.links = service.links.map(function (link) {
                    var _a = link.split(':'), originalServiceName = _a[0], alias = _a[1];
                    return originalServiceName && alias
                        ? resolve_new_service_name_1.resolveNewServiceName(integration, originalServiceName) + ":" + alias
                        : "" + link;
                });
            }
        });
    });
};
var renameServices = function (context) {
    var usedServiceNames = {};
    Object.values(context.integrations).forEach(function (integration) {
        var dockerCompose = integration.dockerCompose;
        var serviceNames = Object.keys(dockerCompose.services);
        serviceNames.forEach(function (originalServiceName) {
            var serviceName = serviceNames.length === 1
                ? integration.name
                : integration.name + "." + originalServiceName;
            if (serviceName in usedServiceNames) {
                serviceName += "-" + ++usedServiceNames[serviceName];
            }
            else {
                usedServiceNames[serviceName] = 1;
            }
            integration.services[serviceName] = {
                originalServiceName: originalServiceName
            };
            if (serviceName !== originalServiceName) {
                dockerCompose.services[serviceName] = integration.dockerCompose.services[originalServiceName];
                delete dockerCompose.services[originalServiceName];
            }
        });
    });
};
var populateInitialDockerCompose = function (context) {
    Object.values(context.integrations).forEach(function (integration) {
        integration.dockerCompose = integration_handler_1.getIntegrationHandler(integration).generateDockerCompose(context, integration);
        resolvePaths(integration.dockerCompose, integration, context.directories.build);
    });
};
exports.generateDockerCompose = function (context) {
    populateInitialDockerCompose(context);
    renameServices(context);
    fixLinks(context);
    return mergeDockerComposes(context);
};

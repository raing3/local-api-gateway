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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerIntegrationHandler = void 0;
var docker_compose_integration_handler_1 = require("./docker-compose-integration-handler");
var DockerIntegrationHandler = (function (_super) {
    __extends(DockerIntegrationHandler, _super);
    function DockerIntegrationHandler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DockerIntegrationHandler.prototype.generateDockerCompose = function (context, integration) {
        var _a;
        return {
            version: '3.8',
            services: (_a = {},
                _a[integration.name] = {
                    build: {
                        context: integration.destination
                    }
                },
                _a)
        };
    };
    return DockerIntegrationHandler;
}(docker_compose_integration_handler_1.DockerComposeIntegrationHandler));
exports.DockerIntegrationHandler = DockerIntegrationHandler;

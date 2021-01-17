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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clone = exports.parseConfig = exports.resolveUriLocalPath = void 0;
var yaml_1 = require("yaml");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
exports.resolveUriLocalPath = function (uri) {
    var parsed = new URL(uri);
    switch (parsed.protocol) {
        case 'file:':
            return path_1.default.relative(process.cwd(), path_1.default.resolve(uri.split(':')[1]));
    }
    throw new Error("Unsupported URI, cannot handle " + uri);
};
exports.parseConfig = function (configPath) {
    var parsed = yaml_1.parse(fs_1.default.readFileSync(configPath, 'utf8'));
    var config = __assign(__assign({}, parsed), { gateway: __assign({ host: 'localhost', port: 80, traceIdHeaderName: 'Trace-Id' }, parsed === null || parsed === void 0 ? void 0 : parsed.gateway), middleware: __assign({}, parsed === null || parsed === void 0 ? void 0 : parsed.middleware), integrations: __assign({}, parsed === null || parsed === void 0 ? void 0 : parsed.integrations) });
    Object.entries(config.integrations).forEach(function (_a) {
        var integrationName = _a[0], integration = _a[1];
        if (!(integration === null || integration === void 0 ? void 0 : integration.destination)) {
            try {
                integration.destination = exports.resolveUriLocalPath(integration.source);
            }
            catch (error) {
                integration.destination = "./" + integrationName;
            }
        }
    });
    if (config.gateway.source) {
        config.gateway.source = exports.resolveUriLocalPath(config.gateway.source);
    }
    return config;
};
exports.clone = function (value) {
    return JSON.parse(JSON.stringify(value));
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveNewServiceName = void 0;
exports.resolveNewServiceName = function (integration, originalServiceName) {
    var result = Object.entries(integration.services).find(function (entry) {
        return entry[1].originalServiceName === originalServiceName;
    });
    if (!result) {
        throw new Error("Cannot find service originally named \"" + originalServiceName + "\" for integration \"" + integration.name + "\"");
    }
    return result[0];
};

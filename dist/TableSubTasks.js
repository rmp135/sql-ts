"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns the additional properties to add to the interface.
 *
 * @export
 * @param {string} tableName The name of the table.
 * @param {string} schemaName The schema of the table.
 * @param {Config} config The configuration to use.
 */
function getAdditionalProperties(tableName, schemaName, config) {
    var fullName = schemaName + "." + tableName;
    if (config.additionalProperties === undefined)
        return [];
    return config.additionalProperties[fullName];
}
exports.getAdditionalProperties = getAdditionalProperties;
/**
 * Returns any extension that should be applied to the interface.
 *
 * @export
 * @param {string} tableName
 * @param {string} schemaName
 * @param {Config} config
 * @returns {string}
 */
function getExtends(tableName, schemaName, config) {
    var fullName = schemaName + "." + tableName;
    if (config.extends === undefined)
        return "";
    return config.extends[fullName];
}
exports.getExtends = getExtends;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Converts a table name to an interface name given a configuration.
 *
 * @export
 * @param {string} name The name of the table.
 * @param {Config} config The configuration to use.
 * @returns
 */
function generateInterfaceName(name, config) {
    var interfaceNamePattern = config.interfaceNameFormat || '${table}Entity';
    return interfaceNamePattern.replace('${table}', name.replace(/ /g, '_'));
}
exports.generateInterfaceName = generateInterfaceName;

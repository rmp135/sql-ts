"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TableTasks = require("./TableTasks");
/**
 * Converts a Database definition to TypeScript.
 *
 * @export
 * @param {Database} database The Database definition.
 * @param {Config} config The configuration to use.
 * @returns A TypeScript definiion, optionally wrapped in a namespace.
 */
function stringifyDatabase(database, config) {
    if (config.schemaAsNamespace) {
        var schemaMap = new Map();
        for (var _i = 0, _a = database.tables; _i < _a.length; _i++) {
            var table = _a[_i];
            if (!schemaMap.has(table.schema)) {
                schemaMap.set(table.schema, []);
            }
            schemaMap.get(table.schema).push(table);
        }
        var namespaces_1 = [];
        schemaMap.forEach(function (tables, schema) {
            namespaces_1.push("export namespace " + schema + " {\n" + tables.map(function (t) { return TableTasks.stringifyTable(t, config).replace(/^(.+)/gm, '  $1'); }).join('\n\n') + "\n}");
        });
        return namespaces_1.join('\n\n');
    }
    else {
        return database.tables.map(function (t) { return TableTasks.stringifyTable(t, config); }).join('\n\n');
    }
}
exports.stringifyDatabase = stringifyDatabase;

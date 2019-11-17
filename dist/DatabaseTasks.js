"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var TableTasks = require("./TableTasks");
var handlebars = require("handlebars");
var fs = require("fs");
var path = require("path");
var ColumnTasks = require("./ColumnTasks");
/**
 * Converts a Database definition to TypeScript.
 *
 * @export
 * @param {Database} database The Database definition.
 * @param {Config} config The configuration to use.
 * @returns A TypeScript definition, optionally wrapped in a namespace.
 */
function stringifyDatabase(database, config) {
    var template = fs.readFileSync(path.join(__dirname, './template.handlebars'), 'utf-8');
    if (config.template !== undefined)
        template = fs.readFileSync(config.template, 'utf-8');
    var compiler = handlebars.compile(template);
    database.tables.sort(function (tableA, tableB) { return tableA.name.localeCompare(tableB.name); });
    var grouped = {};
    for (var _i = 0, _a = database.tables; _i < _a.length; _i++) {
        var t = _a[_i];
        if (grouped[t.schema] === undefined) {
            grouped[t.schema] = [];
        }
        grouped[t.schema].push(t);
    }
    return compiler({ grouped: grouped, tables: database.tables, config: config });
}
exports.stringifyDatabase = stringifyDatabase;
/**
 * Decorates the database object before sending to template compiler.
 *
 * @export
 * @param {Database} database The Database definition.
 * @param {Config} config The configuration to use.
 * @returns The decorated database definition.
 */
function decorateDatabase(database, config) {
    return {
        tables: database.tables.map(function (t) {
            return __assign({}, t, { interfaceName: TableTasks.generateInterfaceName(t.name, config), columns: t.columns.map(function (c) {
                    return __assign({}, c, { propertyName: c.name.replace(/ /g, ''), propertyType: ColumnTasks.convertType(t.name, t.schema, c.name, c.type, config) });
                }) });
        })
    };
}
exports.decorateDatabase = decorateDatabase;

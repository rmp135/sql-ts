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
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorateDatabase = exports.stringifyDatabase = void 0;
var EnumTasks = require("./EnumTasks");
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
    var _a;
    var templatePath = (_a = config.template) !== null && _a !== void 0 ? _a : path.join(__dirname, './template.handlebars');
    var template = fs.readFileSync(templatePath, 'utf-8');
    var compiler = handlebars.compile(template);
    database.tables.sort(function (tableA, tableB) { return tableA.name.localeCompare(tableB.name); });
    var grouped = {};
    for (var _i = 0, _b = database.tables; _i < _b.length; _i++) {
        var t = _b[_i];
        if (grouped[t.schema] === undefined) {
            grouped[t.schema] = { tables: [], enums: [] };
        }
        grouped[t.schema].tables.push(t);
    }
    for (var _c = 0, _d = database.enums; _c < _d.length; _c++) {
        var e = _d[_c];
        if (grouped[e.schema] === undefined) {
            grouped[e.schema] = { tables: [], enums: [] };
        }
        grouped[e.schema].enums.push(e);
    }
    return compiler({
        grouped: grouped,
        config: config
    });
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
        enums: database.enums.map(function (e) {
            return {
                name: e.name,
                convertedName: EnumTasks.generateEnumName(e.name, config),
                schema: e.schema,
                values: Object.keys(e.values).map(function (ee) { return ({
                    originalKey: ee,
                    convertedKey: ee.replace(/ /g, ''),
                    value: e.values[ee]
                }); })
            };
        }),
        tables: database.tables.map(function (t) {
            return __assign(__assign({}, t), { interfaceName: TableTasks.generateInterfaceName(t.name, config), columns: t.columns.map(function (c) {
                    return __assign(__assign({}, c), { propertyName: c.name.replace(/ /g, ''), propertyType: ColumnTasks.convertType(c, t, config) });
                }) });
        })
    };
}
exports.decorateDatabase = decorateDatabase;

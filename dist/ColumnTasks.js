"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var AdapterFactory = require("./AdapterFactory");
var TypeMap_1 = require("./TypeMap");
var ColumnSubTasks = require("./ColumnSubTasks");
/**
 * Returns all columns in a given Table using a knex context.
 *
 * @export
 * @param {knex} db The knex config to use.
 * @param {TableDefinition} table The table to return columns for..
 * @param {Config} config The configuration to use.
 * @returns {Promise<Column[]>}
 */
function getColumnsForTable(db, table, config) {
    return __awaiter(this, void 0, void 0, function () {
        var adapter, columns;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    adapter = AdapterFactory.buildAdapter(config);
                    return [4 /*yield*/, adapter.getAllColumns(db, table.name, table.schema)];
                case 1:
                    columns = _a.sent();
                    return [2 /*return*/, columns.map(function (c) { return ({
                            nullable: c.isNullable,
                            name: c.name,
                            type: c.type,
                            optional: c.isOptional
                        }); })];
            }
        });
    });
}
exports.getColumnsForTable = getColumnsForTable;
/**
 * Converts a database type to that of a JavaScript type.
 *
 * @export
 * @param {string} tableName The name of the table.
 * @param {string} schemaName The schema of the table.
 * @param {string} columnName The column name.
 * @param {string} type The name of the type from the database.
 * @param {Config} config The configuration object.
 * @returns {string}
 */
function convertType(tableName, schema, columnName, type, config) {
    var fullname = ColumnSubTasks.generateFullColumnName(tableName, schema, columnName);
    var convertedType = undefined;
    var overrides = config.typeOverrides || {};
    var userTypeMap = config.typeMap || {};
    convertedType = overrides[fullname];
    if (convertedType == null) {
        convertedType = Object.keys(userTypeMap).find(function (t) { return userTypeMap[t].includes(type); });
    }
    if (convertedType == null) {
        convertedType = Object.keys(TypeMap_1.default).find(function (t) { return TypeMap_1.default[t].includes(type); });
    }
    return convertedType === undefined ? 'any' : convertedType;
}
exports.convertType = convertType;

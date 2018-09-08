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
var ColumnTasks = require("./ColumnTasks");
var TableSubTasks = require("./TableSubTasks");
/**
 * Returns all tables from a given database using a configuration.
 *
 * @export
 * @param {knex} db The knex context to use.
 * @param {Config} config The configuration to use.
 * @returns {Promise<Table[]>}
 */
function getAllTables(db, config) {
    return __awaiter(this, void 0, void 0, function () {
        var adapter, allTables, tables;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    adapter = AdapterFactory.buildAdapter(config.dialect);
                    return [4 /*yield*/, adapter.getAllTables(db, config.schemas || [])];
                case 1:
                    allTables = _a.sent();
                    return [4 /*yield*/, Promise.all(allTables.map(function (table) { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = {};
                                        return [4 /*yield*/, ColumnTasks.getColumnsForTable(db, table, config)];
                                    case 1: return [2 /*return*/, (_a.columns = _b.sent(),
                                            _a.name = table.name,
                                            _a.schema = table.schema,
                                            _a.additionalProperties = TableSubTasks.getAdditionalProperties(table.name, table.schema, config),
                                            _a.extends = TableSubTasks.getExtends(table.name, table.schema, config),
                                            _a)];
                                }
                            });
                        }); }))];
                case 2:
                    tables = _a.sent();
                    return [2 /*return*/, tables];
            }
        });
    });
}
exports.getAllTables = getAllTables;
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

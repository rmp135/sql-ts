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
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
var Table_1 = require("./Table");
var default_1 = (function () {
    /**
     * A representation of a Database.
     *
     * @param db     The knex object for this Database.
     * @param config The configuration for this Database to connect via.
     */
    function default_1(db, config) {
        this.db = db;
        this.config = config || {};
    }
    /**
     * Query the database for table definitions.
     * Not implemented for all database schemas.
     *
     * @returns {Promise<string[]>}
     */
    default_1.prototype.getAllTables = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.db.client.config.dialect;
                        switch (_a) {
                            case 'mysql': return [3 /*break*/, 1];
                            case 'sqlite3': return [3 /*break*/, 3];
                            case 'postgres': return [3 /*break*/, 5];
                            case 'mssql': return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 1: return [4 /*yield*/, this.db('information_schema.tables')
                            .select('table_name')
                            .where({ table_schema: this.db.client.config.connection.database })
                            .map(function (t) { return t.table_name; })];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.db('sqlite_master')
                            .select('tbl_name')
                            .whereNot({ tbl_name: 'sqlite_sequence' })
                            .where({ type: 'table' })
                            .map(function (t) { return t.tbl_name; })];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.db('pg_catalog.pg_tables')
                            .select('tablename')
                            .whereNotIn('schemaname', ['pg_catalog', 'information_schema'])
                            .map(function (t) { return t.tablename; })];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.db('information_schema.tables')
                            .select('table_name')
                            .map(function (t) { return t.table_name; })];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: throw new Error("Fetching all tables is not currently supported for dialect " + this.db.client.config.dialect + ".");
                }
            });
        });
    };
    /**
     * Creates Tables based on the configuration and generates their definitions.
     *
     */
    default_1.prototype.generateTables = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var tables, hasTables_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.config.tables != null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.all(this.config.tables.map(function (t) { return _this.db.schema.hasTable(t); }))];
                    case 1:
                        hasTables_1 = _a.sent();
                        tables = this.config.tables.filter(function (t, index) { return hasTables_1[index]; });
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.getAllTables()];
                    case 3:
                        tables = _a.sent();
                        _a.label = 4;
                    case 4:
                        this.tables = tables.map(function (t) { return new Table_1.default(t, _this); });
                        return [4 /*yield*/, Promise.all(this.tables.map(function (t) { return t.generateColumns(); }))];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * This Database as a line separated list of TypeScript interface definitions.
     *
     * @returns {string}
     */
    default_1.prototype.stringify = function () {
        return this.tables.map(function (t) { return t.stringify(); }).join('\n\n');
    };
    /**
     * This Database as a plain JavaScript object.
     *
     * @returns
     */
    default_1.prototype.toObject = function () {
        return {
            tables: this.tables.map(function (t) { return t.toObject(); })
        };
    };
    return default_1;
}());
exports.default = default_1;

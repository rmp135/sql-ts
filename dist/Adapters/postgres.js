"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
var default_1 = /** @class */ (function () {
    function default_1() {
    }
    default_1.prototype.getAllEnums = function (db, config) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            function getValues(schema, name) {
                var values = {};
                for (var _i = 0, _a = enums.filter(function (e) { return e.schema == schema && e.name == name; }); _i < _a.length; _i++) {
                    var row = _a[_i];
                    values[row.value] = row.value;
                }
                return values;
            }
            var query, enums, foundEnums, _i, enums_1, row, mapKey;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = db('pg_type')
                            .select('pg_namespace.nspname AS schema')
                            .select('pg_type.typname AS name')
                            .select('pg_enum.enumlabel AS value')
                            .join('pg_enum', 'pg_enum.enumtypid', 'pg_type.oid')
                            .join('pg_namespace', 'pg_namespace.oid', 'pg_type.typnamespace');
                        if (((_a = config.schemas) === null || _a === void 0 ? void 0 : _a.length) > 0)
                            query.whereIn('pg_namespace.nspname', config.schemas);
                        return [4 /*yield*/, query];
                    case 1:
                        enums = _b.sent();
                        foundEnums = {};
                        for (_i = 0, enums_1 = enums; _i < enums_1.length; _i++) {
                            row = enums_1[_i];
                            mapKey = row.schema + '.' + row.name;
                            if (foundEnums[mapKey] == undefined) {
                                foundEnums[mapKey] = { name: row.name, schema: row.schema, values: getValues(row.schema, row.name) };
                            }
                        }
                        return [2 /*return*/, Object.values(foundEnums)];
                }
            });
        });
    };
    default_1.prototype.getAllTables = function (db, schemas) {
        return __awaiter(this, void 0, void 0, function () {
            var query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = db('pg_tables')
                            .select('schemaname AS schema')
                            .select('tablename AS name')
                            .union(function (qb) {
                            qb
                                .select('schemaname AS schema')
                                .select('matviewname AS name')
                                .from('pg_matviews');
                            if (schemas.length > 0)
                                qb.whereIn('schemaname', schemas);
                        })
                            .whereNotIn('schemaname', ['pg_catalog', 'information_schema']);
                        if (schemas.length > 0)
                            query.whereIn('schemaname', schemas);
                        return [4 /*yield*/, query];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    default_1.prototype.getAllColumns = function (db, config, table, schema) {
        return __awaiter(this, void 0, void 0, function () {
            var sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sql = "\n      SELECT\n        typns.nspname AS enumSchema,\n        pg_type.typname AS enumType,\n        pg_attribute.attname AS name,\n        pg_namespace.nspname AS schema,\n        pg_catalog.format_type(pg_attribute.atttypid, null) as type,\n        pg_attribute.attnotnull AS notNullable,\n        pg_attribute.atthasdef AS hasDefault,\n        pg_class.relname AS table,\n        pg_type.typcategory AS typcategory,\n        CASE WHEN EXISTS (\n          SELECT null FROM pg_index\n          WHERE pg_index.indrelid = pg_attribute.attrelid\n          AND  pg_attribute.attnum = any(pg_index.indkey)\n        AND pg_index.indisprimary) THEN 1 ELSE 0 END isPrimaryKey\n      FROM pg_attribute\n      JOIN pg_class ON pg_class.oid = pg_attribute.attrelid\n      JOIN pg_type ON pg_type.oid = pg_attribute.atttypid\n      JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace\n      JOIN pg_namespace AS typns ON typns.oid = pg_type.typnamespace\n      where pg_attribute.attnum > 0\n      AND pg_class.relname = :table\n      AND pg_namespace.nspname = :schema\n    ";
                        return [4 /*yield*/, db.raw(sql, { table: table, schema: schema })];
                    case 1: return [2 /*return*/, (_a.sent()).rows
                            .map(function (c) { return ({
                            name: c.name,
                            type: c.typcategory == "E" && config.schemaAsNamespace ? c.enumschema + "." + c.enumtype : c.enumtype,
                            isNullable: !c.notnullable,
                            isOptional: !c.notnullable || c.hasdefault,
                            isEnum: c.typcategory == "E",
                            isPrimaryKey: c.isprimarykey == 1
                        }); })];
                }
            });
        });
    };
    return default_1;
}());
exports.default = default_1;

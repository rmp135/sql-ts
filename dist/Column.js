"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types = {
    number: ['int', 'numeric', 'integer', 'real', 'smallint', 'decimal', 'float', 'double precision', 'double', 'dec', 'fixed', 'year', 'serial', 'bigserial'],
    Date: ['datetime', 'timestamp', 'date', 'time', 'timestamp'],
    boolean: ['bit', 'boolean', 'bool'],
    Object: ['json']
};
var default_1 = (function () {
    function default_1(name, nullable, type, table) {
        this.name = name;
        this.nullable = nullable;
        this.type = type;
        this.table = table;
    }
    default_1.prototype.nullableString = function () {
        return this.nullable ? ' | null' : '';
    };
    default_1.prototype.convertType = function () {
        var _this = this;
        var overrides = this.table.database.config.typeOverrides || {};
        var fullName = this.table.name + "." + this.name;
        var type = undefined;
        if (overrides[fullName] != null) {
            type = overrides[fullName];
        }
        else {
            type = Object.keys(types).find(function (t) { return types[t].includes(_this.type); });
        }
        if (type == null) {
            return 'string';
        }
        else {
            return type;
        }
    };
    default_1.prototype.stringify = function () {
        return this.name + "?: " + this.convertType() + this.nullableString();
    };
    return default_1;
}());
exports.default = default_1;

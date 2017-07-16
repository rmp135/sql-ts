"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types = {
    number: ['int', 'numeric', 'integer', 'real', 'smallint', 'decimal', 'float', 'double precision', 'double', 'dec', 'fixed', 'year', 'serial', 'bigserial'],
    Date: ['datetime', 'timestamp', 'date', 'time', 'timestamp'],
    boolean: ['bit', 'boolean', 'bool'],
    Object: ['json']
};
var default_1 = (function () {
    /**
     * A representation of a database column.
     *
     * @param name     The name of this table.
     * @param nullable Whether this column is nullable.
     * @param type     The type of this column, as retrieved from the database schema.
     * @param table    The Table that this column belongs to.
     */
    function default_1(name, nullable, type, table) {
        var _this = this;
        this.name = name;
        this.nullable = nullable;
        this.type = type;
        var overrides = table.database.config.typeOverrides || {};
        var fullName = table.name + "." + this.name;
        var convertedType = undefined;
        if (overrides[fullName] != null) {
            convertedType = overrides[fullName];
        }
        else {
            convertedType = Object.keys(types).find(function (t) { return types[t].includes(_this.type); });
        }
        this.jsType = convertedType === undefined ? 'string' : convertedType;
    }
    /**
     * This Column as a TypeScript type definition.
     *
     * @returns {string}
     */
    default_1.prototype.stringify = function () {
        return this.name + "?: " + this.jsType + (this.nullable ? ' | null' : '');
    };
    /**
     * This Column as a plain JavaScript object.
     *
     * @returns
     */
    default_1.prototype.toObject = function () {
        return {
            name: this.name,
            type: this.type,
            jsType: this.jsType,
            nullable: this.nullable
        };
    };
    return default_1;
}());
exports.default = default_1;

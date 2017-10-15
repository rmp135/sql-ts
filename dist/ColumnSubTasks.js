"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TypeMap_1 = require("./TypeMap");
/**
 * Generates the full column name comprised of the table, schema and column.
 *
 * @export
 * @param {string} tableName The name of the table that contains the column.
 * @param {string} schemaName The name of the schema that contains the table.
 * @param {string} columnName The name of the column.
 * @returns {string} The full table name.
 */
function generateFullColumnName(tableName, schemaName, columnName) {
    var result = tableName;
    if (schemaName != null && schemaName !== '') {
        result += "." + schemaName;
    }
    result += "." + columnName;
    return result;
}
exports.generateFullColumnName = generateFullColumnName;
/**
 * Converts a database type to that of a JavaScript type.
 *
 * @export
 * @param {string} fullname The complete name of the column.
 * @param {string} type The name of the type from the database.
 * @param {Config} config The configuration object.
 * @returns {string}
 */
function convertType(fullname, type, config) {
    var convertedType = undefined;
    var overrides = config.typeOverrides || {};
    if (overrides[fullname] != null) {
        convertedType = overrides[fullname];
    }
    else {
        convertedType = Object.keys(TypeMap_1.default).find(function (t) { return TypeMap_1.default[t].includes(type); });
    }
    return convertedType === undefined ? 'any' : convertedType;
}
exports.convertType = convertType;

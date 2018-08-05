"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        result = schemaName + "." + result;
    }
    result += "." + columnName;
    return result;
}
exports.generateFullColumnName = generateFullColumnName;

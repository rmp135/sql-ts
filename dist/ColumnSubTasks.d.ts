/**
 * Generates the full column name comprised of the table, schema and column.
 *
 * @export
 * @param {string} tableName The name of the table that contains the column.
 * @param {string} schemaName The name of the schema that contains the table.
 * @param {string} columnName The name of the column.
 * @returns {string} The full table name.
 */
export declare function generateFullColumnName(tableName: string, schemaName: string, columnName: string): string;

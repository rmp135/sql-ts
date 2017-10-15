import { Config } from './Typings';
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
/**
 * Converts a database type to that of a JavaScript type.
 *
 * @export
 * @param {string} fullname The complete name of the column.
 * @param {string} type The name of the type from the database.
 * @param {Config} config The configuration object.
 * @returns {string}
 */
export declare function convertType(fullname: string, type: string, config: Config): string;

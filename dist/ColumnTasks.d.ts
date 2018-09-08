import { TableDefinition } from './Adapters/AdapterInterface';
import * as knex from 'knex';
import { Column, Config } from './Typings';
/**
 * Returns all columns in a given Table using a knex context.
 *
 * @export
 * @param {knex} db The knex config to use.
 * @param {TableDefinition} table The table to return columns for..
 * @param {Config} config The configuration to use.
 * @returns {Promise<Column[]>}
 */
export declare function getColumnsForTable(db: knex, table: TableDefinition, config: Config): Promise<Column[]>;
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
export declare function convertType(tableName: string, schema: string, columnName: string, type: string, config: Config): string;

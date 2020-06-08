import { TableDefinition } from './Adapters/AdapterInterface';
import * as knex from 'knex';
import { Column, Config } from './Typings';
import { Table } from '.';
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
 * @param {Column} column The column definition to convert.
 * @param {Table} table The table that the column belongs to.
 * @param {Config} config The configuration object.
 * @returns {string}
 */
export declare function convertType(column: Column, table: Table, config: Config): string;

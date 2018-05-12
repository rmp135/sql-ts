/// <reference types="knex" />
import { TableDefinition } from './Adapters/AdapterInterface';
import * as knex from 'knex';
import { Column, Config } from './Typings';
/**
 * Converts a Column into a TypeScript type definition.
 *
 * @export
 * @param {Column} column The Column to generate the type definition for.
 * @param {Config} config The configuration to use.
 * @returns {string}
 */
export declare function stringifyColumn(column: Column, config: Config): string;
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

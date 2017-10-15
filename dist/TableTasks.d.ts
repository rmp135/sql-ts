/// <reference types="knex" />
import * as knex from 'Knex';
import { Config, Table } from './Typings';
/**
 * Returns all tables from a given database using a configuration.
 *
 * @export
 * @param {knex} db The knex context to use.
 * @param {Config} config The configuration to use.
 * @returns {Promise<Table[]>}
 */
export declare function getAllTables(db: knex, config: Config): Promise<Table[]>;
/**
 * Returns the Table as a TypeScript interface.
 *
 * @export
 * @param {Table} table The Table to create the interface for.
 * @param {Config} config The configuration to use.
 * @returns {string}
 */
export declare function stringifyTable(table: Table, config: Config): string;

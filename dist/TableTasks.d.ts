import * as knex from 'knex';
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
 * Converts a table name to an interface name given a configuration.
 *
 * @export
 * @param {string} name The name of the table.
 * @param {Config} config The configuration to use.
 * @returns
 */
export declare function generateInterfaceName(name: string, config: Config): string;

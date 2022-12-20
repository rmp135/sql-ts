import { Config, Column, Table, Database } from './Typings'
import * as ConnectionFactory from './ConnectionFactory'
import * as DatabaseTasks from './DatabaseTasks'
import * as ConfigTasks from './ConfigTasks'
import { Knex } from 'knex'

/**
 * Generates a Database definition as a plain JavaScript object.
 *
 * @param {Config} config The configuration to generate this database with.
 * @param {Knex} db The optional Knex context to use.
 * @returns {Promise<Database>} The Database definition as a plain JavaScript object.
 */
async function toObject(config: Config, db?: Knex): Promise<Database> {
  const appliedConfig = ConfigTasks.applyConfigDefaults(config);
  if (db == null) {
    return await ConnectionFactory.createAndRun(
      appliedConfig,
      tempdb => DatabaseTasks.generateDatabase(appliedConfig, tempdb)
    )
  }
  return await DatabaseTasks.generateDatabase(appliedConfig, db);
}

/**
 * Generates a Database definition as a series of TypeScript interfaces.
 *
 * @param {Config} config The configuration to generate this database with.
 * @param {Knex} db The optional Knex context to use.
 * @returns {Promise<string>} The Database definition as a series of TypeScript interfaces.
 */
async function toTypeScript(config: Config, db?: Knex): Promise<string> {
  const appliedConfig = ConfigTasks.applyConfigDefaults(config);
  const database = await toObject(appliedConfig, db);
  return DatabaseTasks.stringifyDatabase(database, appliedConfig);
}

/**
 * Generates TypeScript from an exported database definition.
 *
 * @param database The database object as exported from sql-ts
 * @param config The configuration to generate the TypeScript from.
 * @return {string}  The stringified database.
 */
function fromObject(database: Database, config: Config): string {
  const appliedConfig = ConfigTasks.applyConfigDefaults(config);
  return DatabaseTasks.stringifyDatabase(database, appliedConfig);
}

export default {
  toObject,
  fromObject,
  toTypeScript,
};

export { toObject, fromObject, toTypeScript, Config, Column, Table, Database };

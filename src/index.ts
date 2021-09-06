import { Config, Column, Table, Database } from './Typings'
import * as DatabaseFactory from './DatabaseFactory'
import * as DatabaseTasks from './DatabaseTasks'
import * as ConfigTasks from './ConfigTasks'

/**
 * Generates a Database definition as a plain JavaScript object.
 *
 * @param {Config} rawConfig The configuration to generate this database with.
 * @returns {Promise<DecoratedDatabase>} The Database definition as a plain JavaScript object.
 */
async function toObject(config: Config): Promise<Database> {
  const appliedConfig = ConfigTasks.applyConfigDefaults(config);
  return await DatabaseFactory.buildDatabase(appliedConfig);
}

/**
 * Generates a Database definition as a series of TypeScript interfaces.
 *
 * @param {Config} config The configuration to generate this database with.
 * @returns {Promise<string>} The Database definition as a series of TypeScript interfaces.
 */
async function toTypeScript(config: Config): Promise<string> {
  const appliedConfig = ConfigTasks.applyConfigDefaults(config);
  const database = await toObject(appliedConfig);
  return DatabaseTasks.stringifyDatabase(database, appliedConfig);
}

/**
 * Generates TypeScript from an exported database definition.
 *
 * @param database The database object as exported from sql-ts
 * @param config The configuration to generate the TypeScript from.
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

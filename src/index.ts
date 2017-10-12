import { Config, Database } from './Typings'
import * as DatabaseFactory from './DatabaseFactory'
import * as DatabaseTasks from './DatabaseTasks'

/**
 * Generates a Database definition as a plain JavaScript object.
 * 
 * @param {Config} config       The configuration to generate this database with.
 * @returns {Promise<Database>} The Database definition as a plain JavaScript object.
 */
async function toObject (config: Config): Promise<Database> {
  return await DatabaseFactory.buildDatabase(config)
}

/**
 * Generates a Database definition as a series of TypeScript interfaces.
 * 
 * @param {Config} config       The configuration to generate this database with.
 * @returns {Promise<string>}   The Database definition as a series of TypeScript interfaces.
 */
async function toTypeScript (config: Config): Promise<string> {
  const database = await toObject(config)
  return DatabaseTasks.stringifyDatabase(database, config)
}

/**
 * Generates TypeScript from an exported database definition.
 * 
 * @param database The database object as exported from sql-ts
 * @param config The configuration to generate the TypeScript from.
 */
function fromObject (database: Database, config: Config): string {
  return DatabaseTasks.stringifyDatabase(database, config)
}

export default {
  toObject,
  fromObject,
  toTypeScript
}

export {
  toObject,
  fromObject,
  toTypeScript,
  Config,
  Database
}
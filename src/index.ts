import { buildDatabase } from './DatabaseFactory'
import { Config, Database } from './Typings'

/**
 * Generates a Database definition as a series of TypeScript interfaces.
 * 
 * @deprecated
 * @param {Config} config       The configuration to generate this database with.
 * @returns {Promise<string>}   The Database definition as a series of TypeScript interfaces.
 */
async function generate (config: Config): Promise<string> {
  if (process.env.NODE_ENV !== 'production') {
    console.warn("Deprecation: 'generate' has been deprecated in favour of 'toTypeScript'.")
  }
  return toTypeScript(config)
}

/**
 * Generates a Database definition as a plain JavaScript object.
 * 
 * @param {Config} config       The configuration to generate this database with.
 * @returns {Promise<Database>} The Database definition as a plain JavaScript object.
 */
async function toObject (config: Config): Promise<Database> {
  const database = await buildDatabase(config)
  return database.toObject()
}

/**
 * Generates a Database definition as a series of TypeScript interfaces.
 * 
 * @param {Config} config       The configuration to generate this database with.
 * @returns {Promise<string>}   The Database definition as a series of TypeScript interfaces.
 */
async function toTypeScript (config: Config): Promise<string> {
  const database = await buildDatabase(config)
  return database.stringify()
}

export default {
  generate,
  toObject,
  toTypeScript
}

export {
  generate,
  toObject,
  toTypeScript,
  Config,
  Database
}
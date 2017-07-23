import * as knex from 'knex'
import { Config } from './Typings'
import Database from './Database'

/**
 * Builds a Database and generates its definitions.
 * 
 * @export
 * @param {Config} [config]     The configuration to use.
 * @returns {Promise<Database>} The generated Database.
 */
export async function buildDatabase (config: Config): Promise<Database> {
  let database: Database
  let db: knex
  try {
    db = knex(config)
    database = new Database()
    await database.generateTables(db, config)
  }
  catch (err) {
    throw err
  }
  finally {
    if (db !== undefined) {
      db.destroy()
    }
  }
  return database
}
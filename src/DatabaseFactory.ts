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
    database = new Database(db, config)
    await database.generateTables()
  }
  catch (err) {
    throw err
  }
  finally {
    db.destroy()
  }
  return database
}
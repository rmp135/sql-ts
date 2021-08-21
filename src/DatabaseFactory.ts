import * as knex from 'knex';
import { Config, Database } from './Typings';
import * as DatabaseTasks from './DatabaseTasks'
import * as TableTasks from './TableTasks'
import * as EnumTasks from './EnumTasks'

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

  if (config.knexConnection && !config.dialect) throw new Error('"dialect" property must be set when using a custom connection');
  
  try {
    db = config.knexConnection ? config.knexConnection : knex(config)
    database = {
      tables: await TableTasks.getAllTables(db, config),
      enums: await EnumTasks.getAllEnums(db, config)
    }
  }
  catch (err) {
    throw err
  }
  finally {
    if (db !== undefined && !config.knexConnection) {
      db.destroy()
    }
  }
  return database
}
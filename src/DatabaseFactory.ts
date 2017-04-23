import * as knex from 'knex'
import { Config } from './index'
import Database from './Database'

export async function buildDatabase (db: knex, config?: Config): Promise<Database> {
  const database = new Database(db, config)
  await database.generateTables()
  return database
}
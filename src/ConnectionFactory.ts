import knex, { Knex } from 'knex'
import { Config } from './Typings'

/**
 * Runs a function with a temporary database context.
 *
 * @export
 * @template T
 * @param {Config} config The config to create the database.
 * @param {(d: Knex) => T} func The function to run.
 * @returns {T}
 */
export async function createAndRun<T> (config: Config, func: (d: Knex) => Promise<T>): Promise<T> {
  let db: Knex
  try {
    db = knex(config)
    return await func(db)
  }
  finally {
    await db?.destroy()
  }
}

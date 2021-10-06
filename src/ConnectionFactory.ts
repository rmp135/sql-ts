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
export function createAndRun<T> (config: Config, func: (d: Knex) => T): T {
  let db: Knex
  try {
    db = knex(config)
    return func(db)
  }
  finally {
    db?.destroy()
  }
}

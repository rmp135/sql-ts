import { AdapterInterface } from './Adapters/AdapterInterface'
import { resolveAdapterName } from './SharedTasks'
import { Knex } from 'knex'

/**
 * Returns an AdapterInterface that matches the dialect.
 * 
 * @export
 * @param {string} adapterName The name of SQL adapter that should be returned.
 * @returns {AdapterInterface} The adapter for connecting to a SQL database.
 */
export function buildAdapter (adapterName: string): AdapterInterface {
  const dialect = resolveAdapterName(adapterName)
  let adapter = null
  try {
    adapter = require(`./Adapters/${dialect}`)
  } catch (err) {
    throw new Error(`Unable to find adapter for dialect '${dialect}'.`)
  }
  return new adapter.default()
}
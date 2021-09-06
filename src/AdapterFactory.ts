import { AdapterInterface } from './Adapters/AdapterInterface'
import { Config } from '.'
import { resolveAdapterName } from './SharedTasks'

/**
 * Returns an AdapterInterface that matches the dialect.
 * 
 * @export
 * @param {any} dialect The name of SQL adapter that should be returned.
 * @returns {AdapterInterface} The adapter for connecting to a SQL database.
 */
export function buildAdapter (config: Config): AdapterInterface {
  const dialect = resolveAdapterName(config)
  let adapter = null
  try {
    adapter = require(`./Adapters/${dialect}`)
  } catch (err) {
    throw new Error(`Unable to find adapter for dialect '${dialect}'.`)
  }
  return new adapter.default()
}
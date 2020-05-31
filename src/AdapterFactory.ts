import { AdapterInterface } from './Adapters/AdapterInterface';
import { Config } from '.';

/**
 * Returns an AdapterInterface that matches the dialect.
 * 
 * @export
 * @param {any} dialect The name of SQL adapter that should be returned.
 * @returns {AdapterInterface} The adapter for connecting to a SQL database.
 */
export function buildAdapter (config: Config): AdapterInterface {
  const dialect = config.dialect ?? config.client.toString() 
  // Use aliases from knex.
  // https://github.com/tgriesser/knex/blob/master/src/index.js
  const aliases = {
    'pg' : 'postgres',
    'sqlite' : 'sqlite3',
    'mysql2': 'mysql'
  };
  let adapter = null
  try {
    adapter = require(`./Adapters/${aliases[dialect] ?? dialect}`)
  } catch (err) {
    throw new Error(`Unable to find adapter for dialect '${dialect}'.`)
  }
  return new adapter.default()
}
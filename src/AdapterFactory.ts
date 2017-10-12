import { AdapterInterface } from './Adapters/AdapterInterface';

/**
 * Returns an AdapterInterface that matches the dialect.
 * 
 * @export
 * @param {any} dialect The name of SQL adapter that should be returned.
 * @returns {AdapterInterface} The adapter for connecting to a SQL database.
 */
export function buildAdapter (dialect): AdapterInterface {
  // Use aliases from knex.
  // https://github.com/tgriesser/knex/blob/master/src/index.js
  const aliases = {
    'pg' : 'postgres',
    'sqlite' : 'sqlite3'
  };
  let adapter = null
  try {
    adapter = require(`./Adapters/${aliases[dialect] || dialect}`)
  } catch (err) {
    throw new Error(`Unable to find adapter for dialect '${dialect}'.`)
  }
  return new adapter.default()
}
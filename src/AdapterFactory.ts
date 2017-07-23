import { AdapterInterface } from './Adapters/AdapterInterface';

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
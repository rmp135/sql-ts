import { AdapterInterface } from './Adapters/AdapterInterface.js'
import { resolveAdapterName } from './SharedTasks.js'
import mysql from './Adapters/mysql.js'
import mssql from './Adapters/mssql.js'
import postgres from './Adapters/postgres.js'
import sqlite from './Adapters/sqlite.js'

const adapters: Record<string, AdapterInterface> = {
  'mysql': mysql,
  'mssql': mssql,
  'postgres': postgres,
  'sqlite': sqlite
}

/**
 * Returns an AdapterInterface that matches the dialect.
 * 
 * @export
 * @param {string} adapterName The name of SQL adapter that should be returned.
 * @returns {AdapterInterface} The adapter for connecting to a SQL database.
 */
export function buildAdapter(adapterName: string): AdapterInterface {
  const dialect = resolveAdapterName(adapterName)
  const adapter = adapters[dialect]
  if (!adapter) {
    throw new Error(`Unable to find adapter for dialect '${dialect}'.`)
  }
  return adapter
}
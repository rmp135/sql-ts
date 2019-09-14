import * as AdapterFactory from './AdapterFactory'
import * as knex from 'knex'
import { TableDefinition } from './Adapters/AdapterInterface'
import { Column, Config, Table } from './Typings'
import * as ColumnTasks from './ColumnTasks'
import * as TableSubTasks from './TableSubTasks'

/**
 * Returns all tables from a given database using a configuration.
 * 
 * @export
 * @param {knex} db The knex context to use.
 * @param {Config} config The configuration to use.
 * @returns {Promise<Table[]>} 
 */
export async function getAllTables (db: knex, config: Config): Promise<Table[]> {
  const adapter = AdapterFactory.buildAdapter(config)
  const allTables = await adapter.getAllTables(db, config.schemas || [])
  const tables =  await Promise.all(allTables.map(async table => ({
    columns: await ColumnTasks.getColumnsForTable(db, table, config),
    name: table.name,
    schema: table.schema,
    additionalProperties: TableSubTasks.getAdditionalProperties(table.name, table.schema, config),
    extends: TableSubTasks.getExtends(table.name, table.schema, config)
  } as Table)))
  return tables
}

/**
 * Converts a table name to an interface name given a configuration.
 * 
 * @export
 * @param {string} name The name of the table.
 * @param {Config} config The configuration to use.
 * @returns 
 */
export function generateInterfaceName (name: string, config: Config): string {
  const interfaceNamePattern = config.interfaceNameFormat || '${table}Entity'
  if (interfaceNamePattern === 'PascalCase') {
    return name.split('_').map(s => {
      if (!s.length) return s;
      return s[0].toUpperCase() + s.substr(1).toLowerCase();
    }).join('');
  }
  return interfaceNamePattern.replace('${table}', name.replace(/ /g, '_'))
}
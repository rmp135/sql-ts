import * as AdapterFactory from './AdapterFactory'
import * as knex from 'knex'
import { Config, Table } from './Typings'
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
  const tables = config.tables || []
  const excludedTables = config.excludedTables || []
  const schemas = config.schemas || []
  const adapter = AdapterFactory.buildAdapter(config)
  const allTables = (await adapter.getAllTables(db, schemas))
    .filter(table => tables.length == 0 || tables.includes(`${table.schema}.${table.name}`))
    .filter(table => !excludedTables.includes(`${table.schema}.${table.name}`))
  return await Promise.all(allTables.map(async table => ({
    columns: await ColumnTasks.getColumnsForTable(db, table, config),
    name: table.name,
    schema: table.schema,
    additionalProperties: TableSubTasks.getAdditionalProperties(table.name, table.schema, config),
    extends: TableSubTasks.getExtends(table.name, table.schema, config)
  } as Table)))
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
  name = name.replace(/ /g, '_')
  name = TableSubTasks.convertTableCase(name, config.tableNameCasing)
  if (config.singularTableNames && name[name.length - 1] == "s") {
    name = name.substr(0, name.length - 1)
  }
  return interfaceNamePattern.replace('${table}', name)
}
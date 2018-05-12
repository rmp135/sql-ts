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
  const adapter = AdapterFactory.buildAdapter(config.dialect)
  const allTables = await adapter.getAllTables(db, config.schemas || [])
  const tables =  await Promise.all(allTables.map(async table => ({
    columns: await ColumnTasks.getColumnsForTable(db, table, config),
    name: table.name,
    schema: table.schema,
  } as Table)))
  return tables
}

/**
 * Returns the Table as a TypeScript interface.
 * 
 * @export
 * @param {Table} table The Table to create the interface for.
 * @param {Config} config The configuration to use.
 * @returns {string} 
 */
export function stringifyTable (table: Table, config: Config): string {
  return `export interface ${TableSubTasks.generateInterfaceName(table.name, config)} {
${table.columns.map(c => `  ${ColumnTasks.stringifyColumn(c, config)}`).join('\n')}
}`}
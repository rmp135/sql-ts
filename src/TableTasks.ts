import { buildAdapter } from './AdapterFactory';
import * as knex from 'Knex';
import { TableDefinition } from './Adapters/AdapterInterface';
import { Column, Config, Table } from './Typings';
import * as ColumnTasks from './ColumnTasks'

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
  return interfaceNamePattern.replace('${table}', name.replace(/ /g, '_'))
}

/**
 * Returns all tables from a given database using a configuration.
 * 
 * @export
 * @param {knex} db The knex context to use.
 * @param {Config} config The configuration to use.
 * @returns {Promise<Table[]>} 
 */
export async function getAllTables (db: knex, config: Config): Promise<Table[]> {
  const adapter = buildAdapter(config.dialect)
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
  return `export interface ${generateInterfaceName(table.name, config)} {
${table.columns.map(c => `  ${ColumnTasks.stringifyColumn(c)}`).join('\n')}
}`}
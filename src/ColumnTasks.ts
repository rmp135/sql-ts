import { TableDefinition } from './Adapters/AdapterInterface'
import * as AdapterFactory from './AdapterFactory'
import * as knex from 'knex'
import { Column, Config, optionality } from './Typings'
import TypeMap from './TypeMap'
import * as ColumnSubTasks from './ColumnSubTasks'

/**
 * Converts a Column into a TypeScript type definition.
 * 
 * @export
 * @param {Column} column The Column to generate the type definition for.
 * @param {Config} config The configuration to use.
 * @returns {string} 
 */
export function stringifyColumn (column: Column, config: Config): string {
  let optionality = config.propertyOptionality === 'required' ? '' : '?'
  if (config.propertyOptionality == 'dynamic') {
    optionality = column.optional ? '?' : ''
  }
  return `${column.name}${optionality}: ${column.jsType}${column.nullable ? ' | null' : ''}`
}

/**
 * Returns all columns in a given Table using a knex context.
 * 
 * @export
 * @param {knex} db The knex config to use.
 * @param {TableDefinition} table The table to return columns for..
 * @param {Config} config The configuration to use.
 * @returns {Promise<Column[]>} 
 */
export async function getColumnsForTable (db: knex, table: TableDefinition, config: Config): Promise<Column[]> {
  const adapter = AdapterFactory.buildAdapter(config.dialect)
  const columns = await adapter.getAllColumns(db, table.name, table.schema)
  return columns.map(c => ({
    jsType: ColumnSubTasks.convertType(ColumnSubTasks.generateFullColumnName(table.name, table.schema, c.name), c.type, config),
    nullable: c.isNullable,
    name: c.name,
    type: c.type,
    optional: c.isOptional
  } as Column))
}
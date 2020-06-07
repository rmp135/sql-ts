import { TableDefinition } from './Adapters/AdapterInterface'
import * as AdapterFactory from './AdapterFactory'
import * as knex from 'knex'
import { Column, Config } from './Typings'
import TypeMap from './TypeMap'
import * as ColumnSubTasks from './ColumnSubTasks'
import * as SharedTasks from './SharedTasks'
import { Table } from '.'

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
  const adapter = AdapterFactory.buildAdapter(config)
  const columns = await adapter.getAllColumns(db, config, table.name, table.schema)
  return columns.map(c => ({
    nullable: c.isNullable,
    name: SharedTasks.convertCase(c.name, config.columnNameCasing),
    type: c.type,
    optional: c.isOptional,
    isEnum: c.isEnum
  } as Column))
}
/**
 * Converts a database type to that of a JavaScript type.
 * 
 * @export
 * @param {Column} column The column definition to convert.
 * @param {Table} table The table that the column belongs to.
 * @param {Config} config The configuration object.
 * @returns {string}
 */
export function convertType (column: Column, table: Table, config: Config): string {
  if (column.isEnum) {
    return column.type.replace(/ /g, '')
  }
  const fullname = ColumnSubTasks.generateFullColumnName(table.name, table.schema, column.name)
  let convertedType = undefined
  const overrides = config.typeOverrides || {}
  const userTypeMap = config.typeMap || {}
  convertedType = overrides[fullname]
  if (convertedType == null) {
    convertedType = Object.keys(userTypeMap).find(t => userTypeMap[t].includes(column.type))
  }
  if (convertedType == null) {
    convertedType = Object.keys(TypeMap).find(t => TypeMap[t].includes(column.type))
  }
  return convertedType === undefined ? 'any' : convertedType
}
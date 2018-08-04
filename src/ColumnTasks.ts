import { TableDefinition } from './Adapters/AdapterInterface'
import * as AdapterFactory from './AdapterFactory'
import * as knex from 'knex'
import { Column, Config } from './Typings'
import TypeMap from './TypeMap'
import * as ColumnSubTasks from './ColumnSubTasks'

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
    nullable: c.isNullable,
    name: c.name,
    type: c.type,
    optional: c.isOptional
  } as Column))
}
/**
 * Converts a database type to that of a JavaScript type.
 * 
 * @export
 * @param {string} tableName The name of the table.
 * @param {string} schemaName The schema of the table.
 * @param {string} columnName The column name.
 * @param {string} type The name of the type from the database.
 * @param {Config} config The configuration object.
 * @returns {string}
 */
export function convertType (tableName: string, schema: string, columnName: string, type: string, config: Config): string {
  const fullname = ColumnSubTasks.generateFullColumnName(tableName, schema, columnName)
  let convertedType = undefined
  const overrides = config.typeOverrides || {}
  const userTypeMap = config.typeMap || {}
  convertedType = overrides[fullname]
  if (convertedType == null) {
    convertedType = Object.keys(userTypeMap).find(t => userTypeMap[t].includes(type))
  }
  if (convertedType == null) {
    convertedType = Object.keys(TypeMap).find(t => TypeMap[t].includes(type))
  }
  return convertedType === undefined ? 'any' : convertedType
}
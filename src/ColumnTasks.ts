import { TableDefinition } from './Adapters/AdapterInterface';
import { buildAdapter } from './AdapterFactory';
import * as knex from 'Knex';
import { Column, Config } from './Typings';
import TypeMap from './TypeMap'

/**
 * Converts a database type to that of a JavaScript type.
 * 
 * @export
 * @param {string} name The name of the column.
 * @param {string} type The name of the type from the database.
 * @param {Config} config The configuration object.
 * @returns {string}
 */
export function convertType (tableName: string, columnName: string, type: string, config: Config): string {
  let convertedType = undefined
  const fullname = `${tableName}.${columnName}`
  const overrides = config.typeOverrides || {}
  if (overrides[fullname] != null) {
    convertedType = overrides[fullname]
  } else {
    convertedType = Object.keys(TypeMap).find(t => TypeMap[t].includes(type))
  }
  return convertedType === undefined ? 'any' : convertedType
}

/**
 * Converts a Column into a TypeScript type definition.
 * 
 * @export
 * @param {Column} column The Column to generate the type definition for.
 * @returns {string} 
 */
export function stringifyColumn (column: Column): string {
  return `${column.name}?: ${column.jsType}${column.nullable ? ' | null' : ''}`
}

/**
 * Returns all columns in a given Table using a knex context.
 * 
 * @export
 * @param {knex} db The knex config to use.
 * @param {TableDefinition} table The table to return columns for.
 * @param {Config} config The configuration to use.
 * @returns {Promise<Column[]>} 
 */
export async function getColumnsForTable (db: knex, table: TableDefinition, config: Config): Promise<Column[]> {
  const adapter = buildAdapter(config.dialect)
  const columns = await adapter.getAllColumns(db, table.name, table.schema)
  return columns.map(c => ({
    jsType: convertType(table.name, c.name, c.type, config),
    nullable: c.isNullable,
    name: c.name,
    type: c.type
  } as Column))
}
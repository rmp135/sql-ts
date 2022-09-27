import { ColumnDefinition, TableDefinition } from './Adapters/AdapterInterface'
import * as AdapterFactory from './AdapterFactory'
import { Knex } from 'knex'
import { Column, Config } from './Typings'
import * as SharedTasks from './SharedTasks'
import TypeMap from './TypeMap'
import * as EnumTasks from './EnumTasks'
import * as SchemaTasks from './SchemaTasks'

/**
 * Returns all columns in a given Table using a knex context.
 * 
 * @export
 * @param {knex} db The knex config to use.
 * @param {TableDefinition} table The table to return columns for..
 * @param {Config} config The configuration to use.
 * @returns {Promise<Column[]>} 
 */
export async function getColumnsForTable (db: Knex, table: TableDefinition, config: Config): Promise<Column[]> {
  const adapter = AdapterFactory.buildAdapter(db.client.dialect)
  const columns = await adapter.getAllColumns(db, config, table.name, table.schema)
  columns.sort((a, b) => a.name.localeCompare(b.name))
  return columns.map(column => (
    {
      ...column,
      propertyName: SharedTasks.convertCase(column.name.replace(/ /g,''), config.columnNameCasing),
      propertyType: convertType(column, table, config, (db.client as Knex.Client).dialect),
      optional: getOptionality(column, table, config)
    } as Column))
}

/**
 * Generates the optionality specification for a given column, given the optionality option.
 *
 * @export
 * @param {ColumnDefinition} column The column to generate optionality for.
 * @param {TableDefinition} table The table the column is in.
 * @param {Config} config The configuration object.
 * @returns {boolean} The optionality of the specified column.
 */
export function getOptionality (column: ColumnDefinition, table: TableDefinition, config: Config): boolean {
  let optionality = config.globalOptionality
  const columnName = generateFullColumnName(table.name, table.schema, column.name)
  if (config.columnOptionality[columnName]) {
    optionality = config.columnOptionality[columnName]
  }
  if (optionality == 'optional') {
    return true
  }
  else if (optionality == 'required') {
    return false
  }
  return column.optional
}

/**
 * Generates the full column name comprised of the table, schema and column.
 * 
 * @export
 * @param {string} tableName The name of the table that contains the column.
 * @param {string} schemaName The name of the schema that contains the table.
 * @param {string} columnName The name of the column.
 * @returns {string} The full table name.
 */
export function generateFullColumnName (tableName: string, schemaName: string, columnName: string): string {
  let result = tableName
  if  (schemaName != null && schemaName !== '') {
    result = `${schemaName}.${result}`
  }
  return `${result}.${columnName}`
}

/**
 * Converts a database type to that of a JavaScript type.
 *
 * @export
 * @param {Column} column The column definition to convert.
 * @param {Table} table The table that the column belongs to.
 * @param {Config} config The configuration object.
 * @param dialect The dialect of the database.
 * @returns {string}
 */
 export function convertType (column: ColumnDefinition, table: TableDefinition, config: Config, dialect: string): string {
  if (column.isEnum) {
    return convertEnumType(column, config)
  }
  const fullname = generateFullColumnName(table.name, table.schema, column.name)
  
  let convertedType = null
  const overrides = config.typeOverrides
  const userTypeMap = config.typeMap
  
  // Start with user config overrides.
  convertedType = overrides[fullname]
  // Then check the user config typemap.
  if (convertedType == null) {
    convertedType = Object.keys(userTypeMap).find(t => userTypeMap[t].includes(column.type))
  }

  // Then the schema specific typemap.
  if (convertedType == null) {
    const resolvedDialect = SharedTasks.resolveAdapterName(dialect)
    const perDBTypeMap = TypeMap[resolvedDialect]
    if (perDBTypeMap != null) {
      convertedType = Object.keys(perDBTypeMap).find(f => perDBTypeMap[f].includes(column.type))
    }
  }
  
  // Then the global type map.
  if (convertedType == null) {
    let globalMap = TypeMap['global']
    convertedType = Object.keys(globalMap).find(f => globalMap[f].includes(column.type))
  }

  // Finally just any type.
  return convertedType == null ? 'any' : convertedType
}

/**
 * Converts the enum type, prepending the schema if required.
 *
 * @export
 * @param {ColumnDefinition} column The column definition with an enum type.
 * @param {Config} config The configuration object.
 * @returns {string}
 */
export function convertEnumType (column:  ColumnDefinition, config: Config): string {
  const enumName = EnumTasks.generateEnumName(column.type, config)
  if (column.enumSchema != null && config.schemaAsNamespace) {
    const schemaName = SchemaTasks.generateSchemaName(column.enumSchema)
    return `${schemaName}.${enumName}`
  }
  return enumName
}

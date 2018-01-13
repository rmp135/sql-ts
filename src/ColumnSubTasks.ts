import { Config } from './Typings'
import TypeMap from './TypeMap'

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
    result += `.${schemaName}`
  }
  result += `.${columnName}`
  return result
}

/**
 * Converts a database type to that of a JavaScript type.
 * 
 * @export
 * @param {string} fullname The complete name of the column.
 * @param {string} type The name of the type from the database.
 * @param {Config} config The configuration object.
 * @returns {string}
 */
export function convertType (fullname: string, type: string, config: Config): string {
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
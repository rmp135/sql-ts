import { Knex } from 'knex'
import { ColumnDefinition, TableDefinition } from './Adapters/AdapterInterface.js'

/**
 * The configuration file for creating new databases.
 * 
 * @export
 * @interface Config
 * @extends {knex.Config}
 */
export interface Config extends Knex.Config {
  tables?: string[]
  excludedTables?: string[]
  filename?: string
  interfaceNameFormat?: string
  enumNameFormat?: string
  tableNameCasing?: string
  columnNameCasing?: string
  enumNameCasing?: string
  enumKeyCasing?: string
  singularTableNames?: boolean
  schemaAsNamespace?: boolean
  schemas?: string[]
  template?: string
  enumNumericKeyFormat?: string
  tableEnums?: Record<string, { key: string, value: string }>
  globalOptionality?: 'optional' | 'required' | 'dynamic'
  columnOptionality?: Record<string, 'optional' | 'required' | 'dynamic'>
  columnSortOrder?: 'source' | 'alphabetical'
  typeMap?: Record<string, string[]>
  typeOverrides?: Record<string, string>
  additionalProperties?: Record<string, string[]>
  extends?: Record<string, string>
  custom?: Record<string, any>
} 


export interface SchemaDefinition {
  name: string
  tables: Table[]
  enums: Enum[]
}

export interface Schema extends SchemaDefinition {
  namespaceName: string
}

/**
 * The JSON definition of a table with additional properties
 * 
 * @export
 * @interface Table
 */
export interface Table extends TableDefinition {
  interfaceName: string
  name: string
  schema: string
  columns: Column[]
  extends?: string
  additionalProperties?: string[]
  comment: string
}

/**
 * The JSON definition of a database.
 * 
 * @export
 * @interface Database
 */
export interface Database {
  schemas: Schema[]
  custom?: Record<string,any>
}

/**
 * Enum value with original and converted keys.
 *
 * @export
 * @interface EnumValue
 */
export interface EnumValue {
  originalKey: string
  convertedKey: string
  value: string | number
}

export interface Enum {
  schema: string
  name: string
  convertedName: string
  values: EnumValue[]
}

/**
 * JSON definition of a database column with additional fields.
 *
 * @export
 * @interface Column
 */
export interface Column extends ColumnDefinition {
  propertyName: string
  propertyType: string
}

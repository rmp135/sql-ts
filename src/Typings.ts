import { Knex } from 'knex'
import { ColumnDefinition, TableDefinition } from './Adapters/AdapterInterface'

/**
 * The configuration file for creating new databases.
 * 
 * @export
 * @interface Config
 * @extends {knex.Config}
 */
export interface Config extends Knex.Config {
  tables?: string[],
  excludedTables?: string[] | ((tableDefinition: TableDefinition) => boolean),
  filename?: string,
  folder?: string,
  interfaceNameFormat?: string,
  enumNameFormat?: string,
  tableNameCasing?: string,
  columnNameCasing?: string,
  enumNameCasing?: string,
  enumKeyCasing?: string
  singularTableNames?: boolean
  schemaAsNamespace?: boolean,
  schemas?: string[],
  template?: string,
  enumNumericKeyFormat?: string,
  tableEnums?: {
    [key: string]: {
      key: string,
      value: string
    }
  },
  globalOptionality?: 'optional' | 'required' | 'dynamic'
  columnOptionality?: {
    [key: string]: 'optional' | 'required' | 'dynamic'
  }
  typeMap?: {
    [key: string]: string[]
  }
  typeOverrides?: { 
    [key: string]: string 
  },
  additionalProperties?: { 
    [key: string]: string[]
  },
  extends?: { 
    [key: string]: string
  },
  custom?: Record<string, any>
} 

/**
 * The JSON definition of a table with additional properties
 * 
 * @export
 * @interface Table
 */
export interface Table extends TableDefinition {
  interfaceName: string
  name: string,
  schema: string,
  columns: Column[]
  extends?: string
  additionalProperties?: string[],
  comment: string
}

/**
 * The JSON definition of a database.
 * 
 * @export
 * @interface Database
 */
export interface Database {
  tables: Table[]
  enums: Enum[]
  custom?: Record<string,any>
}

/**
 * Enum value with original and converted keys.
 *
 * @export
 * @interface EnumValue
 */
export interface EnumValue {
  originalKey: string;
  convertedKey: string;
  value: string | number;
}

export interface Enum {
  schema: string;
  name: string;
  convertedName: string,
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

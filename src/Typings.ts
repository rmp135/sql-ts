import * as knex from 'knex'; 

/**
 * The configuration file for creating new databases.
 * 
 * @export
 * @interface Config
 * @extends {knex.Config}
 */
export interface Config extends knex.Config {
  tables?: string[],
  excludedTables?: string[],
  filename?: string,
  folder?: string,
  interfaceNameFormat?: string,
  tableNameCasing?: 'pascal' | 'camel',
  columnNameCasing?: 'pascal' | 'camel',
  enumNameCasing?: 'pascal' | 'camel',
  singularTableNames?: boolean
  schemaAsNamespace?: boolean,
  schemas?: string[],
  template?: string,
  typeMap?: {
    [key: string]: string[]
  }
  typeOverrides?: { 
    [key: string]: string 
  },
  additionalProperties?: { 
    [key: string]: string []
  },
  extends?: { 
    [key: string]: string
  }
} 

/**
 * The JSON definition of a column for importing and exporting.
 * 
 * @export
 * @interface Column
 */
export interface Column {
  name: string,
  type: string,
  optional: boolean,
  nullable: boolean,
  isEnum: boolean,
  isPrimaryKey: boolean
}

export interface Enum {
  name: string;
  schema: string;
  values: {
    [key: string]: string
  }
}
/**
 * The JSON definition of a table for importing and exporting.
 * 
 * @export
 * @interface Table
 */
export interface Table {
  name: string,
  schema: string,
  columns: Column[]

  /**
   * This string is a class or interface that this definition should extend
   *
   * @type {string}
   * @memberof Table
   */
  extends?: string

  /**
   *  This array of string will be added as properties to the object
   *  when it is exported
   *
   * @type {string[]}
   * @memberof Table
   */
  additionalProperties?: string[],
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
}

/**
 * JSON definition of a database with additional fields.
 *
 * @export
 * @interface DecoratedDatabase
 */
export interface DecoratedDatabase {
  tables: DecoratedTable[],
  enums: DecoratedEnum[]
}

export interface DecoratedEnum {
  schema: string;
  name: string;
  convertedName: string;
  values: {
    originalKey: string;
    convertedKey: string;
    value: string;
  }[]
}

/**
 * JSON definition of a database table with additional fields.
 *
 * @export
 * @interface DecoratedDatabase
 */
export interface DecoratedTable extends Table {
  interfaceName: string
  columns: DecoratedColumn[]
}

/**
 * JSON definition of a database column with additional fields.
 *
 * @export
 * @interface DecoratedDatabase
 */
export interface DecoratedColumn extends Column {
  propertyName: string
  propertyType: string
}

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
  filename?: string,
  interfaceNameFormat?: string,
  enumNameFormat?: string,
  schemaAsNamespace?: boolean,
  schemas?: string[],
  typeMap?: {
    [key: string]: string[]
  }
  typeOverrides?: { 
    [key: string]: string 
  }
  enumTables?: {
    [key: string]: {
      [key: string]: string
    }
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
  jsType: string,
  nullable: boolean
}

export interface Table {
  name: string,
  schema: string,
  columns: Column[]
}

export interface EnumTable {
  table: string,
  schema: string,
  enums: {
    id: number,
    value: string
  }[]
}

/**
 * The JSON definition of a database for importing and exporting.
 * 
 * @export
 * @interface Database
 */
export interface Database {
  tables: Table[],
  enums: EnumTable[]
}
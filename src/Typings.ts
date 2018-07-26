import * as knex from 'knex'; 

export type optionality = 'required' | 'optional' | 'dynamic'

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
  schemaAsNamespace?: boolean,
  schemas?: string[],
  typeMap?: {
    [key: string]: string[]
  }
  typeOverrides?: { 
    [key: string]: string 
  },
  propertyOptionality?: optionality,
  createClasses?: boolean
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
  optional: boolean,
  nullable: boolean
}

/**
 * The JSON definition of a taboe for importing and exporting.
 * 
 * @export
 * @interface Table
 */
export interface Table {
  name: string,
  schema: string,
  columns: Column[]

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
 * The JSON definition of a database for importing and exporting.
 * 
 * @export
 * @interface Database
 */
export interface Database {
  tables: Table[]
}
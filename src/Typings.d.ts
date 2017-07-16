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
  typeOverrides?: { 
    [key: string]: string 
  } 
} 

/**
 * A Database definition as a plain JavaScript object.
 * 
 * @export
 * @interface Database
 */
export interface Database {
  tables: {
    name: string,
    columns: {
      name: string,
      type: string,
      jsType: string,
      nullable: boolean
    }[]
  }[]
}
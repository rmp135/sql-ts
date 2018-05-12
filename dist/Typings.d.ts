import * as knex from 'knex';
export declare type optionality = 'required' | 'optional' | 'dynamic';
/**
 * The configuration file for creating new databases.
 *
 * @export
 * @interface Config
 * @extends {knex.Config}
 */
export interface Config extends knex.Config {
    tables?: string[];
    filename?: string;
    interfaceNameFormat?: string;
    schemaAsNamespace?: boolean;
    schemas?: string[];
    typeMap?: {
        [key: string]: string[];
    };
    typeOverrides?: {
        [key: string]: string;
    };
    propertyOptionality?: optionality;
}
/**
 * The JSON definition of a column for importing and exporting.
 *
 * @export
 * @interface Column
 */
export interface Column {
    name: string;
    type: string;
    jsType: string;
    optional: boolean;
    nullable: boolean;
}
export interface Table {
    name: string;
    schema: string;
    columns: Column[];
}
/**
 * The JSON definition of a database for importing and exporting.
 *
 * @export
 * @interface Database
 */
export interface Database {
    tables: Table[];
}

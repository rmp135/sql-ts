import { Knex } from 'knex'
import { Config } from '../Typings'

// Basic definitions that all databases should implement. 

/**
 * Raw table definition from the database.
 *
 * @export
 * @interface TableDefinition
 */
export interface TableDefinition {
  schema: string;
  name: string;
  comment: string;
}

/**
 * Raw column definition from the database.
 *
 * @export
 * @interface ColumnDefinition
 */
export interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  optional: boolean;
  isEnum: boolean;
  isPrimaryKey: boolean;
  // The schema the enum belongs to. Currently only used for postgres.
  enumSchema?: string;
  comment: string
  defaultValue: any;
}

/**
 * Raw enum definition from the database.
 *
 * @export
 * @interface EnumDefinition
 */
 export interface EnumDefinition {
  name: string;
  schema: string;
  values: {[key: string]: string | number}
}

/**
 * Interface that all adapters should implement.
 *
 * @export
 * @interface AdapterInterface
 */
export interface AdapterInterface {
  getAllTables (db: Knex, schemas: string[]): Promise<TableDefinition[]>;
  getAllColumns (db: Knex, config: Config, table: string, schema: string): Promise<ColumnDefinition[]>;
  getAllEnums (db: Knex, config: Config): Promise<EnumDefinition[]>;
}
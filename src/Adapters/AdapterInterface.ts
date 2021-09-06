import { Knex } from 'knex'
import { Config } from '../Typings'

// Basic definitions that all databases should return. 

/**
 * Raw table definition from the database.
 *
 * @export
 * @interface TableDefinition
 */
export interface TableDefinition {
  schema: string;
  name: string;
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
}

/**
 * Enum definition for use before and after parsing.
 *
 * @export
 * @interface EnumDefinition
 * @template T
 */
export interface EnumBaseDefinition<T> {
  name: string;
  schema: string;
  values: T
}

/**
 * Raw enum definition from the database.
 *
 * @export
 * @interface EnumBaseDefinition
 * @extends {EnumBaseDefinition<{[key: string]: string}>}
 */
export interface EnumDefinition extends EnumBaseDefinition<{[key: string]: string}> { }

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
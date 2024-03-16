import { Knex } from 'knex'
import { Config } from '../Typings.js'

type ColumnType = 'Standard' | 'NumericEnum' | 'StringEnum'

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
  columnType: ColumnType;
  isPrimaryKey: boolean;
  // The schema the enum belongs to. Currently only used for postgres.
  enumSchema?: string;
  // The allowed values of the a StringEnum type. Currently only used for mysql.
  stringEnumValues?: string[];
  comment: string;
  defaultValue: string | null;
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
  values: Record<string, string | number>
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
import { Config, EnumTable } from '../Typings';
import * as knex from 'knex';

export interface DatabaseDefinition {
  tables: TableDefinition[]
}

export interface TableDefinition {
  schema: string;
  name: string;
}

export interface ColumnDefinition {
  name: string;
  type: string;
  isNullable: boolean;
}

export interface AdapterInterface {
  getAllTables (db: knex, schemas: string[]): Promise<TableDefinition[]>;
  getAllColumns (db: knex, table: string, schema: string): Promise<ColumnDefinition[]>;
  getEnumsForTable (db: knex, schema: string, table: string, idColumn: string, valueColumn: string): Promise<EnumTable>;
}
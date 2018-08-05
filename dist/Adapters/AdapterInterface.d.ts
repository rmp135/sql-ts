/// <reference types="knex" />
import * as knex from 'knex';
export interface DatabaseDefinition {
    tables: TableDefinition[];
}
export interface TableDefinition {
    schema: string;
    name: string;
}
export interface ColumnDefinition {
    name: string;
    type: string;
    isNullable: boolean;
    isOptional: boolean;
}
export interface AdapterInterface {
    getAllTables(db: knex, schemas: string[]): Promise<TableDefinition[]>;
    getAllColumns(db: knex, table: string, schema: string): Promise<ColumnDefinition[]>;
}

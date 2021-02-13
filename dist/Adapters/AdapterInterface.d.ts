import * as knex from 'knex';
import { Config } from '../Typings';
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
    isEnum: boolean;
    isPrimaryKey: boolean;
}
export interface EnumDefinition {
    name: string;
    schema: string;
    values: {
        [key: string]: string;
    };
}
export interface AdapterInterface {
    getAllTables(db: knex, schemas: string[]): Promise<TableDefinition[]>;
    getAllColumns(db: knex, config: Config, table: string, schema: string): Promise<ColumnDefinition[]>;
    getAllEnums(db: knex, config: Config): Promise<EnumDefinition[]>;
}

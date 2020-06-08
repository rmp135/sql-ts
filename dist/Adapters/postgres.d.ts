import * as knex from 'knex';
import { AdapterInterface, TableDefinition, ColumnDefinition, EnumDefinition } from './AdapterInterface';
import { Config } from '..';
export default class implements AdapterInterface {
    getAllEnums(db: knex, config: Config): Promise<EnumDefinition[]>;
    getAllTables(db: knex, schemas: string[]): Promise<TableDefinition[]>;
    getAllColumns(db: knex, config: Config, table: string, schema: string): Promise<ColumnDefinition[]>;
}

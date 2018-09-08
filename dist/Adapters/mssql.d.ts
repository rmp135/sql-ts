import * as knex from 'knex';
import { AdapterInterface, TableDefinition, ColumnDefinition } from './AdapterInterface';
export default class implements AdapterInterface {
    getAllTables(db: knex, schemas: string[]): Promise<TableDefinition[]>;
    getAllColumns(db: knex, table: string, schema: string): Promise<ColumnDefinition[]>;
}

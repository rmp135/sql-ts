import * as knex from 'knex'
import { AdapterInterface, TableDefinition, ColumnDefinition } from './AdapterInterface'

export default class implements AdapterInterface {
  async getAllTables(db: knex, schemas: string[]): Promise<TableDefinition[]> {
    return await db('information_schema.tables')
    .select('TABLE_NAME AS name')
    .select('TABLE_SCHEMA AS schema')
  }
  async getAllColumns(db: knex, table: string, schema: string): Promise<ColumnDefinition[]> {
    return await db('information_schema.columns')
    .select('COLUMN_NAME AS name')
    .select(db.raw(`(CASE WHEN IS_NULLABLE = 'NO' THEN 0 ELSE 1 END) AS isNullable`))
    .select('DATA_TYPE AS type')
    .where({ table_name: table, table_schema: schema })
    .map((c: { name: string, type: string, isNullable: string } ) => ({ ...c, isNullable: !!c.isNullable }) as ColumnDefinition)
  }
}
import * as knex from 'knex'
import { AdapterInterface, TableDefinition, ColumnDefinition } from './AdapterInterface'

export default class implements AdapterInterface {
  async getAllTables(db: knex, schemas: string[]): Promise<TableDefinition[]> {
    const query = db('INFORMATION_SCHEMA.TABLES')
    .select('TABLE_NAME AS name')
    .select('TABLE_SCHEMA AS schema')
    if (schemas.length > 0)
      query.whereIn('TABLE_SCHEMA', schemas)
    return await query
  }
  async getAllColumns(db: knex, table: string, schema: string): Promise<ColumnDefinition[]> {
    return await db('INFORMATION_SCHEMA.COLUMNS')
    .select('COLUMN_NAME AS name')
    .select('IS_NULLABLE AS isNullable')
    .select('DATA_TYPE AS type')
    .where({ table_name: table, table_schema: schema })
    .map((c: { name: string, type: string, isNullable: string } ) => ({ ...c, isNullable: c.isNullable === 'YES' }) as ColumnDefinition)
  }
}
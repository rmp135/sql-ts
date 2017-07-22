import { Config } from '../Typings';
import * as knex from 'knex';
import { AdapterInterface, TableDefinition, ColumnDefinition } from './AdapterInterface'

export default class implements AdapterInterface {
  async getAllTables(db: knex, schemas: string[]): Promise<TableDefinition[]> {
    const query = db('information_schema.tables')
    .select('TABLE_NAME AS name')
    .select('TABLE_SCHEMA AS schema')
    .whereNotIn('TABLE_SCHEMA', ['information_schema'])
    if (schemas.length > 0)
      query.whereIn('table_schema', schemas)
    return await query
  }
  async getAllColumns(db: knex, table: string, schema: string): Promise<ColumnDefinition[]> {
    return await db('information_schema.columns')
    .select('column_name AS name')
    .select(db.raw(`(CASE WHEN is_nullable = 'NO' THEN 0 ELSE 1 END) AS isNullable`))
    .select('data_type AS type')
    .where({ table_name: table, table_schema: schema })
    .map((c: { name: string, type: string, isNullable: string } ) => ({ ...c, isNullable: !!c.isNullable }) as ColumnDefinition)
  }
}
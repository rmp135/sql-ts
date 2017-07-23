import * as knex from 'knex'
import { AdapterInterface, TableDefinition, ColumnDefinition } from './AdapterInterface'

export default class implements AdapterInterface {
  async getAllTables(db: knex, schemas: string[]): Promise<TableDefinition[]> {
    const query = db("pg_catalog.pg_tables")
    .select("schemaname AS schema")
    .select("tablename AS name")
    .whereNotIn("schemaname", ["pg_catalog", "information_schema"])
    if (schemas.length > 0)
      query.whereIn('schemaname', schemas)
    return await query
  }
  async getAllColumns(db: knex, table: string, schema: string): Promise<ColumnDefinition[]> {
    return await db('information_schema.columns')
    .select('column_name AS name')
    .select('udt_name AS type')
    .select('is_nullable AS isNullable')
    .where({ table_name: table, table_schema: schema })
  }
}
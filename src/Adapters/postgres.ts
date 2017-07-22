import * as knex from 'knex'
import { AdapterInterface, TableDefinition, ColumnDefinition } from './AdapterInterface'

export default class implements AdapterInterface {
  async getAllTables(db: knex, schemas: string[]): Promise<TableDefinition[]> {
    const query = db
    .select("schemaname AS schema")
    .select("tablename AS name")
    .from("pg_catalog.pg_tables")
    .whereNotIn("schemaname", ["pg_catalog", "information_schema"])
    if (schemas.length > 0)
      query.whereIn('schemaname', schemas)
    return await query
  }
  async getAllColumns(db: knex, table: string, schema: string): Promise<ColumnDefinition[]> {
    return await db
    .select('column_name as name')
    .select('udt_name as type')
    .select('is_nullable as isNullable')
    .from("information_schema.columns")
    .where({ table_name: table, table_schema: schema })
  }
}
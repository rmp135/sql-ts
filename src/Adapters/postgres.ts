import * as knex from 'knex'
import { AdapterInterface, TableDefinition, ColumnDefinition } from './AdapterInterface'

export default class implements AdapterInterface {
  async getAllTables(db: knex, schemas: string[]): Promise<TableDefinition[]> {
    const query = db('pg_catalog.pg_tables')
    .select('schemaname AS schema')
    .select('tablename AS name')
    .union(qb => {
      qb
      .select('schemaname AS schema')
      .select('matviewname AS name')
      .from('pg_catalog.pg_matviews')
    })
    .whereNotIn('schemaname', ['pg_catalog', 'information_schema'])
    if (schemas.length > 0)
      query.whereIn('schemaname', schemas)
    return await query
  }
  async getAllColumns(db: knex, table: string, schema: string): Promise<ColumnDefinition[]> {
    return await db
    .select('pg_attribute.attname AS name')
    .select('pg_namespace.nspname AS schema')
    .select(db.raw('pg_catalog.format_type(pg_attribute.atttypid, null) AS type'))
    .select('pg_attribute.attnotnull AS notNullable')
    .select('pg_attribute.atthasdef AS hasDefault')
    .select('pg_class.relname AS table')
    .from('pg_attribute')
    .join('pg_class', 'pg_attribute.attrelid', 'pg_class.oid')
    .join('pg_namespace', 'pg_class.relnamespace', 'pg_namespace.oid')
    .where({ 'pg_class.relname': table, 'pg_namespace.nspname': schema })
    .where('pg_attribute.attnum', '>', 0)
    .map((c: { name: string, type: string, notNullable: boolean, hasDefault: boolean } ) => (
      {
        ...c,
        isNullable: !c.notNullable,
        isOptional: c.hasDefault
      }) as ColumnDefinition)
  }
}
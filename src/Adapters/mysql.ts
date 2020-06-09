import * as knex from 'knex';
import { AdapterInterface, TableDefinition, ColumnDefinition, EnumDefinition } from './AdapterInterface'
import { Config } from '..';

export default class implements AdapterInterface {
  getAllEnums(db: knex, config: Config): Promise<EnumDefinition[]> {
    return Promise.resolve([])
  }
  async getAllTables(db: knex, schemas: string[]): Promise<TableDefinition[]> {
    const query = db('information_schema.tables')
    .select('TABLE_NAME AS name')
    .select('TABLE_SCHEMA AS schema')
    .whereNotIn('TABLE_SCHEMA', ['mysql', 'information_schema', 'performance_schema', 'sys'])
    if (schemas.length > 0)
      query.whereIn('table_schema', schemas)
    return await query
  }
  async getAllColumns(db: knex, config: Config, table: string, schema: string): Promise<ColumnDefinition[]> {
    return (await db('information_schema.columns')
    .select('column_name AS name')
    .select(db.raw('(CASE WHEN is_nullable = \'NO\' THEN 0 ELSE 1 END) AS isNullable'))
    .select(db.raw('(SELECT CASE WHEN LOCATE(\'auto_increment\', extra) <> 0 OR COLUMN_DEFAULT IS NOT NULL THEN 1 ELSE 0 END) AS isOptional'))
    .select('data_type AS type')
    .where({ table_name: table, table_schema: schema }))
    .map((c: { name: string, type: string, isNullable: string, isOptional: number } ) => (
      {
        name: c.name,
        type: c.type,
        isNullable: !!c.isNullable,
        isOptional: c.isOptional === 1,
        isEnum: false
      }
      ) as ColumnDefinition)
  }
}
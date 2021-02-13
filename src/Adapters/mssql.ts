import * as knex from 'knex'
import { AdapterInterface, TableDefinition, ColumnDefinition, EnumDefinition } from './AdapterInterface'
import { Config } from '..'

export default class implements AdapterInterface {
  getAllEnums(db: knex, config: Config): Promise<EnumDefinition[]> {
    return Promise.resolve([])
  }
  async getAllTables(db: knex, schemas: string[]): Promise<TableDefinition[]> {
    const query = db('INFORMATION_SCHEMA.TABLES')
    .select('TABLE_NAME AS name')
    .select('TABLE_SCHEMA AS schema')
    if (schemas.length > 0)
      query.whereIn('TABLE_SCHEMA', schemas)
    return await query
  }
  async getAllColumns(db: knex, config: Config, table: string, schema: string): Promise<ColumnDefinition[]> {
    const sql = `
      SELECT
        COLUMN_NAME as name,
        IS_NULLABLE AS isNullable,
        DATA_TYPE as type,
        CASE WHEN EXISTS(
          SELECT NULL FROM information_schema.table_constraints t
          JOIN information_schema.key_column_usage k on k.constraint_name = t.constraint_name AND k.table_name = t.table_name AND k.table_schema = t.table_schema
          WHERE t.table_name = c.table_name
          AND k.column_name = c.column_name
          AND k.table_schema = c.table_schema
          AND t.constraint_type = 'PRIMARY KEY'
        ) THEN 1 ELSE 0 END AS isPrimaryKey,
        CASE WHEN COLUMNPROPERTY(object_id(TABLE_SCHEMA+'.'+TABLE_NAME), COLUMN_NAME, 'IsIdentity') = 1 OR COLUMN_DEFAULT IS NOT NULL THEN 1 ELSE 0 END AS isOptional
        FROM INFORMATION_SCHEMA.COLUMNS c
        WHERE c.TABLE_NAME = :table
        AND c.TABLE_SCHEMA = :schema
      `
    return (await db.raw(sql, { table, schema}))
      .map((c: { name: string, type: string, isOptional: number, isNullable: string, isPrimaryKey: number } ) => (
        {
          name: c.name,
          type: c.type,
          isNullable: c.isNullable === 'YES', 
          isOptional: c.isOptional === 1,
          isEnum: false,
          isPrimaryKey: c.isPrimaryKey == 1
      }) as ColumnDefinition)
  }
}
import { Knex } from 'knex'
import { AdapterInterface, TableDefinition, ColumnDefinition, EnumDefinition } from './AdapterInterface'
import { Config } from '..'

export default class implements AdapterInterface {
  getAllEnums(db: Knex, config: Config): Promise<EnumDefinition[]> {
    return Promise.resolve([])
  }
  
  async getAllTables(db: Knex, schemas: string[]): Promise<TableDefinition[]> {
    const query = db('information_schema.tables')
    .select('TABLE_NAME AS name')
    .select('TABLE_SCHEMA AS schema')
    .whereNotIn('TABLE_SCHEMA', ['mysql', 'information_schema', 'performance_schema', 'sys'])
    if (schemas.length > 0)
      query.whereIn('table_schema', schemas)
    return await query
  }

  async getAllColumns(db: Knex, config: Config, table: string, schema: string): Promise<ColumnDefinition[]> {
    const sql = `
      SELECT
        column_name as name,
        is_nullable as isNullable,
        CASE WHEN LOCATE('auto_increment', extra) <> 0 OR COLUMN_DEFAULT IS NOT NULL THEN 1 ELSE 0 END isOptional,
        CASE WHEN EXISTS(
          SELECT NULL FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
          WHERE CONSTRAINT_NAME = 'PRIMARY'
          AND kcu.TABLE_NAME = c.TABLE_NAME
          AND kcu.TABLE_SCHEMA = c.TABLE_SCHEMA
          AND kcu.COLUMN_NAME = c.COLUMN_NAME
        ) THEN 1 ELSE 0 END isPrimaryKey,
        data_type AS type
        FROM information_schema.columns c
        WHERE table_name = :table
        AND c.TABLE_SCHEMA = :schema
      `
    return ((await db.raw(sql, {table,schema}))[0])
    .map((c: { name: string, type: string, isNullable: string, isOptional: number, isPrimaryKey: number } ) => (
      {
        name: c.name,
        type: c.type,
        nullable: c.isNullable == 'YES',
        optional: c.isOptional === 1,
        isEnum: false,
        isPrimaryKey: c.isPrimaryKey == 1
      }
      ) as ColumnDefinition)
  }
}

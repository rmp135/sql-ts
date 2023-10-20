import { Knex } from 'knex'
import { AdapterInterface, TableDefinition, ColumnDefinition, EnumDefinition } from './AdapterInterface'
import { Config } from '..'
import * as SharedAdapterTasks from './SharedAdapterTasks'

export default class implements AdapterInterface {
  async getAllEnums(db: Knex, config: Config): Promise<EnumDefinition[]> {
    return await SharedAdapterTasks.getTableEnums(db, config)
  }
  
  async getAllTables(db: Knex, schemas: string[]): Promise<TableDefinition[]> {
    const sql = `
      SELECT
        TABLE_NAME AS name,
        TABLE_SCHEMA AS 'schema',
        COALESCE(NULLIF(TABLE_COMMENT, 'VIEW'), '') AS comment
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA NOT IN('mysql', 'information_schema', 'performance_schema', 'sys')
      ${schemas.length > 0 ? ' AND TABLE_SCHEMA IN (:schemas)' : ''}`
    return (await db.raw(sql, { schemas }))[0]
  }

  async getAllColumns(db: Knex, config: Config, table: string, schema: string): Promise<ColumnDefinition[]> {
    const sql = `
      SELECT
        column_name as name,
        is_nullable as isNullable,
        column_comment as comment,
        COLUMN_DEFAULT AS defaultValue,
        CASE WHEN LOCATE('auto_increment', extra) <> 0 OR COLUMN_DEFAULT IS NOT NULL THEN 1 ELSE 0 END isOptional,
        CASE WHEN EXISTS(
          SELECT NULL FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
          WHERE CONSTRAINT_NAME = 'PRIMARY'
          AND kcu.TABLE_NAME = :table
          AND kcu.TABLE_SCHEMA = :schema
          AND kcu.COLUMN_NAME = c.COLUMN_NAME
        ) THEN 1 ELSE 0 END isPrimaryKey,
        data_type AS type
        FROM information_schema.columns c
        WHERE TABLE_NAME = :table
        AND c.TABLE_SCHEMA = :schema
        order by ordinal_position
      `
    return (await db.raw(sql, { table, schema }))[0]
      .map((c: MySQLColumn) => (
        {
          name: c.name,
          type: c.type,
          nullable: c.isNullable == 'YES',
          optional: c.isOptional === 1,
          isEnum: false,
          isPrimaryKey: c.isPrimaryKey == 1,
          comment: c.comment,
          defaultValue: c.defaultValue?.toString() ?? null,
        }
      ) as ColumnDefinition)
  }
}

interface MySQLColumn {
  name: string,
  type: string,
  isNullable: 'YES' | 'NO',
  isOptional: 1 | 0,
  isPrimaryKey: 1 | 0,
  comment: string,
  defaultValue: string | null
}
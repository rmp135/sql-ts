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
        TABLE_NAME name,
        TABLE_SCHEMA [schema],
        COALESCE(EP.value, '') comment
        FROM INFORMATION_SCHEMA.TABLES
        OUTER APPLY (
          SELECT TOP 1 value FROM fn_listextendedproperty (NULL, 'schema', TABLE_SCHEMA, 'table', TABLE_NAME, null, null) EP WHERE EP.name = 'MS_Description'
          UNION
          SELECT TOP 1 value FROM fn_listextendedproperty (NULL, 'schema', TABLE_SCHEMA, 'view', TABLE_NAME, null, null) EP WHERE EP.name = 'MS_Description'
        ) EP 
      ${schemas.length > 0 ? `WHERE TABLE_SCHEMA IN (:schemas)` : ''}`
    return await db.raw(sql, { schemas })
  }
  
  async getAllColumns(db: Knex, config: Config, table: string, schema: string): Promise<ColumnDefinition[]> {
    const sql = `
      SELECT
				COLUMN_NAME as name,
				IS_NULLABLE AS isNullable,
				DATA_TYPE as type,
        COLUMN_DEFAULT as defaultValue,
				CASE WHEN EXISTS(
					SELECT NULL FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS t
					JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE k 
					ON k.CONSTRAINT_NAME = t.CONSTRAINT_NAME 
					AND k.TABLE_NAME = t.TABLE_NAME 
					AND k.TABLE_SCHEMA = t.TABLE_SCHEMA
					WHERE t.TABLE_NAME = c.TABLE_NAME
					AND k.COLUMN_NAME = c.COLUMN_NAME
					AND k.TABLE_SCHEMA = c.TABLE_SCHEMA
					AND t.CONSTRAINT_NAME = 'PRIMARY KEY'
				) THEN 1 ELSE 0 END AS isPrimaryKey,
				CASE WHEN COLUMNPROPERTY(object_id(TABLE_SCHEMA+'.'+TABLE_NAME), COLUMN_NAME, 'IsIdentity') = 1 OR COLUMN_DEFAULT IS NOT NULL THEN 1 ELSE 0 END AS isOptional,
        COALESCE(EP.value, '') comment
        FROM INFORMATION_SCHEMA.COLUMNS c
        OUTER APPLY (SELECT TOP 1 value FROM fn_listextendedproperty (NULL, 'schema', TABLE_SCHEMA, 'table', TABLE_NAME, 'column', COLUMN_NAME) EP WHERE EP.name = 'MS_Description') EP 
        WHERE c.TABLE_NAME = :table
        AND c.TABLE_SCHEMA = :schema
      `
    return (await db.raw(sql, { table, schema }))
      .map((c: MSSQLColumn) => (
        {
          name: c.name,
          type: c.type,
          nullable: c.isNullable === 'YES', 
          optional: c.isOptional === 1 || c.isNullable == 'YES',
          isEnum: false,
          isPrimaryKey: c.isPrimaryKey == 1,
          comment: c.comment,
          defaultValue: c.defaultValue?.toString() ?? null,
      }) as ColumnDefinition)
  }
}

interface MSSQLColumn {
  name: string,
  type: string,
  isOptional: 1 | 0,
  isNullable: 'YES' | 'NO',
  isPrimaryKey: 1 | 0,
  comment: string,
  defaultValue: string | null
}
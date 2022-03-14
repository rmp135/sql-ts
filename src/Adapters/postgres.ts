import { Knex } from 'knex'
import { AdapterInterface, TableDefinition, ColumnDefinition, EnumDefinition } from './AdapterInterface'
import { Config } from '..'
import { uniqBy } from 'lodash'
import * as SharedAdapterTasks from './SharedAdapterTasks'

export default class implements AdapterInterface {
  async getAllEnums(db: Knex, config: Config): Promise<EnumDefinition[]> {
    const sql = `
    SELECT 
      pg_namespace.nspname AS schema, 
      pg_enum.enumsortorder AS order, 
      pg_type.typname AS name, 
      pg_enum.enumlabel AS value 
    FROM pg_type
    JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid
    JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace
    ${config.schemas.length > 0 ? ` WHERE pg_namespace.nspname = ANY(:schemas)` : ''}
    `
    const ungroupedEnums = (await db.raw(sql, { schemas: config.schemas }) as { rows: PostgresEnum[] }).rows

    const groupedEnums: EnumDefinition[] = uniqBy(ungroupedEnums, e => `${e.name}.${e.schema}`)
      .map(row => ({
        name: row.name,
        schema: row.schema,
        values: Object.fromEntries(
          ungroupedEnums
            .filter(e => e.schema == row.schema && e.name == row.name)
            .sort()
            .map(e => [e.value, e.value])
        )
      }))
    const tableEnums = await SharedAdapterTasks.getTableEnums(db, config)
    return groupedEnums.concat(tableEnums)
  }
  
  async getAllTables(db: Knex, schemas: string[]): Promise<TableDefinition[]> {
    const sql = `
      WITH schemas AS (
        SELECT nspname AS name, oid AS oid
        FROM pg_namespace
        WHERE nspname <> 'information_schema' AND nspname NOT LIKE 'pg_%'
        ${schemas.length > 0 ? ` AND nspname = ANY(:schemas)` : ''}
        )
        SELECT schemas.name AS schema,
            pg_class.relname AS name,
            COALESCE(pg_catalog.OBJ_DESCRIPTION( pg_class.oid , 'pg_class' ), '') AS comment
        FROM pg_class
            JOIN schemas ON schemas.oid = pg_class.relnamespace
        WHERE pg_class.relkind IN ('r', 'p', 'v', 'm')
    `
    const results = await db.raw(sql, { schemas }) as { rows: TableDefinition[] }
    return results.rows
  }

  async getAllColumns(db: Knex, config: Config, table: string, schema: string): Promise<ColumnDefinition[]> {
    const sql = `
      SELECT
        typns.nspname typeschema,
        pg_type.typname,
        pg_attribute.attname AS name,
        pg_namespace.nspname AS schema,
        pg_catalog.format_type(pg_attribute.atttypid, null) as type,
        pg_attribute.attnotnull AS notNullable,
        pg_attribute.atthasdef OR pg_attribute.attidentity <> '' AS hasDefault,
        pg_class.relname AS table,
        pg_type.typcategory AS typcategory,
        COALESCE(pg_catalog.col_description(pg_class.oid, pg_attribute.attnum), '') as comment,
        CASE WHEN EXISTS (
          SELECT null FROM pg_index
          WHERE pg_index.indrelid = pg_attribute.attrelid
          AND  pg_attribute.attnum = any(pg_index.indkey)
        AND pg_index.indisprimary) THEN 1 ELSE 0 END isPrimaryKey
      FROM pg_attribute
      JOIN pg_class ON pg_class.oid = pg_attribute.attrelid
      JOIN pg_type ON pg_type.oid = pg_attribute.atttypid
      JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
      JOIN pg_namespace AS typns ON typns.oid = pg_type.typnamespace
      where pg_attribute.attnum > 0
      AND pg_class.relname = :table
      AND pg_namespace.nspname = :schema
    `
    return (await db.raw(sql, { table, schema }))
      .rows
      .map((c: PostgresColumn) => (
        {
          name: c.name,
          type: c.typname,
          nullable: !c.notnullable,
          optional: c.hasdefault || !c.notnullable,
          isEnum: c.typcategory == 'E',
          isPrimaryKey: c.isprimarykey == 1,
          enumSchema: c.typeschema,
          comment: c.comment
        }) as ColumnDefinition)
  }
}

interface PostgresColumn {
  name: string,
  type: string,
  notnullable: boolean,
  hasdefault: boolean,
  typcategory: string,
  typeschema: string,
  typname: string,
  isprimarykey: number,
  comment: string
}

interface PostgresEnum {
  schema: string,
  name: string,
  value: string,
  order: number
}
import { Knex } from 'knex'
import { TableDefinition, ColumnDefinition, EnumDefinition } from './AdapterInterface.js'
import { Config } from '../index.js'
import * as SharedAdapterTasks from './SharedAdapterTasks.js'

async function getAllEnums(db: Knex, config: Config): Promise<EnumDefinition[]> {
  return await SharedAdapterTasks.getTableEnums(db, config)
}

async function getAllTables(db: Knex, schemas: string[]): Promise<TableDefinition[]> {
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

async function getAllColumns(db: Knex, config: Config, table: string, schema: string): Promise<ColumnDefinition[]> {
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
      data_type AS type,
      column_type AS fullType
      FROM information_schema.columns c
      WHERE TABLE_NAME = :table
      AND c.TABLE_SCHEMA = :schema
      ORDER BY ORDINAL_POSITION
    `
  return (await db.raw(sql, { table, schema }))[0]
    .map((c: MySQLColumn) => (
      {
        name: c.name,
        type: c.fullType == 'tinyint(1)' ? c.fullType : c.type, // tinyint(1) typically aliased as a boolean
        nullable: c.isNullable == 'YES',
        optional: c.isOptional === 1 || c.isNullable == 'YES',
        columnType: c.type == 'enum' ? 'StringEnum' : 'Standard',
        isPrimaryKey: c.isPrimaryKey == 1,
        comment: c.comment,
        stringEnumValues: c.type == 'enum' ? parseEnumString(c.fullType) : undefined,
        defaultValue: c.defaultValue?.toString() ?? null,
      }
    ) as ColumnDefinition)
}

/**
 * Parses an ENUM string into an array of strings
 * @param enumString The enum string in the format 'enum('value1','value2')'
 * @returns The enum values as an array of strings
 */
function parseEnumString(enumString: string): string[] {
  return enumString
    .replace(/enum\('/, '') // Remove leading enum definition
    .slice(0, -2) // Remove the last two characters (') and the trailing single quote that is part of b'enum('
    .replace(/''/g, "'") // Replace escaped single quotes with normal single quotes
    .replace(/\\\\'/g, "\\") // Replace double slashes with single slashes
    .split(/','/) // Split by ',' which is the separator between ENUM values
    .map(value =>
    value
      .replace(/^'/, '') // Remove leading single quote
      .replace(/'$/, '') // Remove trailing single quote
  )
}

export default {
  getAllEnums,
  getAllTables,
  getAllColumns,
  parseEnumString
}

interface MySQLColumn {
  name: string,
  type: string,
  fullType: string,
  isNullable: 'YES' | 'NO',
  isOptional: 1 | 0,
  isPrimaryKey: 1 | 0,
  comment: string,
  defaultValue: string | null
}
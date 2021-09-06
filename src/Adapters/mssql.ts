import { Knex } from 'knex'
import { AdapterInterface, TableDefinition, ColumnDefinition, EnumDefinition } from './AdapterInterface'
import { Config } from '..'

export default class implements AdapterInterface {
  getAllEnums(db: Knex, config: Config): Promise<EnumDefinition[]> {
    return Promise.resolve([])
  }

  async getAllTables(db: Knex, schemas: string[]): Promise<TableDefinition[]> {
    const query = db('INFORMATION_SCHEMA.TABLES')
    .select('TABLE_NAME AS name')
    .select('TABLE_SCHEMA AS schema')
    if (schemas.length > 0)
      query.whereIn('TABLE_SCHEMA', schemas)
    return await query
  }
  
  async getAllColumns(db: Knex, config: Config, table: string, schema: string): Promise<ColumnDefinition[]> {
    const sql = `
      SELECT
				COLUMN_NAME as name,
				IS_NULLABLE AS isNullable,
				DATA_TYPE as type,
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
          nullable: c.isNullable === 'YES', 
          optional: c.isOptional === 1 || c.isNullable == 'YES',
          isEnum: false,
          isPrimaryKey: c.isPrimaryKey == 1
      }) as ColumnDefinition)
  }
}

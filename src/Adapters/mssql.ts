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
    return (await db('INFORMATION_SCHEMA.COLUMNS')
      .select('COLUMN_NAME AS name')
      .select('IS_NULLABLE AS isNullable')
      .select(db.raw('CASE WHEN COLUMNPROPERTY(object_id(TABLE_SCHEMA+\'.\'+TABLE_NAME), COLUMN_NAME, \'IsIdentity\') = 1 OR COLUMN_DEFAULT IS NOT NULL THEN 1 ELSE 0 END AS isOptional'))
      .select('DATA_TYPE AS type')
      .where({ table_name: table, table_schema: schema }))
      .map((c: { name: string, type: string, isOptional: number, isNullable: string } ) => (
        {
          name: c.name,
          type: c.type,
          isNullable: c.isNullable === 'YES', 
          isOptional: c.isOptional === 1,
          isEnum: false
      }) as ColumnDefinition)
  }
}
import { EnumTable } from '../Typings';
import * as knex from 'knex';
import { AdapterInterface, ColumnDefinition, TableDefinition } from './AdapterInterface';

export default class implements AdapterInterface {
  async getAllTables(db: knex, schemas: string[]): Promise<TableDefinition[]> {
    const query = db('INFORMATION_SCHEMA.TABLES')
    .select('TABLE_NAME AS name')
    .select('TABLE_SCHEMA AS schema')
    if (schemas.length > 0)
      query.whereIn('TABLE_SCHEMA', schemas)
    return await query
  }
  async getAllColumns(db: knex, table: string, schema: string): Promise<ColumnDefinition[]> {
    return await db('INFORMATION_SCHEMA.COLUMNS')
    .select('COLUMN_NAME AS name')
    .select('IS_NULLABLE AS isNullable')
    .select('DATA_TYPE AS type')
    .where({ table_name: table, table_schema: schema })
    .map((c: { name: string, type: string, isNullable: string } ) => ({ ...c, isNullable: c.isNullable === 'YES' }))
  }
  async getEnumsForTable(db: knex, schema: string, table: string, idColumn: string, valueColumn: any): Promise<EnumTable> {
    const tableParts = table.split('.')
    const tableName = tableParts[tableParts.length-1]
    return {
      table: tableName,
      schema: schema,
      enums: await db(`${schema}.${table}`)
      .select(`${idColumn} AS id`)
      .select(`${valueColumn} AS value`)
    } 
  }
}
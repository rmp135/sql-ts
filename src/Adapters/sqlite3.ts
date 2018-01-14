import { EnumTable } from '../Typings';
import * as knex from 'knex';
import { AdapterInterface, ColumnDefinition, TableDefinition } from './AdapterInterface';

export default class implements AdapterInterface {
  async getAllTables(db: knex, schemas: string[]): Promise<TableDefinition[]> {
    return await db('sqlite_master')
    .select('tbl_name AS name')
    .whereNot({ tbl_name: 'sqlite_sequence' })
    .where({ type: 'table'})
    .map((t: { name: string }) => ({ name: t.name, schema: 'main' }))
  }
  async getAllColumns(db: knex, table: string, schema: string): Promise<ColumnDefinition[]> {
    const def = await db(table).columnInfo()
    const columns: ColumnDefinition[] = []
    for (let key in def) {
      const value = def[key]
      columns.push({ isNullable: value.nullable, name: key, type: value.type })
    }
    return columns
  }
  async getEnumsForTable(db: knex, schema: string, table: string, idColumn: string, valueColumn: any): Promise<EnumTable> {
    return {
      table: table,
      schema: 'main',
      enums: await db(table)
      .select(`${idColumn} AS id`)
      .select(`${valueColumn} AS value`)
    }
  }
}
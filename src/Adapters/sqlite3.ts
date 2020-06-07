import * as knex from 'knex'
import { AdapterInterface, TableDefinition, ColumnDefinition, EnumDefinition } from './AdapterInterface'
import { Config } from '..'

export default class implements AdapterInterface {
  getAllEnums(db: knex, config: Config): Promise<EnumDefinition[]> {
    return Promise.resolve([])
  }
  async getAllTables(db: knex, schemas: string[]): Promise<TableDefinition[]> {
    return (await db('sqlite_master')
    .select('tbl_name AS name')
    .whereNot({ tbl_name: 'sqlite_sequence' })
    .whereIn('type', ['table', 'view']))
    .map((t: { name: string }) => ({ name: t.name, schema: 'main' }))
  }
  async getAllColumns(db: knex, config: Config, table: string, schema: string): Promise<ColumnDefinition[]> {
    return (await db.raw(`pragma table_info(${table})`))
    .map((c: { name: string, type: String, notnull: number, dflt: any, pk: number }) => (
      {
        name: c.name,
        isNullable: c.notnull === 0,
        type: (c.type.includes('(') ? c.type.split('(')[0] : c.type).toLowerCase(),
        isOptional: c.dflt != null || c.pk == 1,
        isEnum: false
      } as ColumnDefinition
    ))
  }
}
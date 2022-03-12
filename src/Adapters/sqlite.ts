import { Knex } from 'knex'
import { AdapterInterface, TableDefinition, ColumnDefinition, EnumDefinition } from './AdapterInterface'
import { Config } from '..'

export default class implements AdapterInterface {
  getAllEnums(db: Knex, config: Config): Promise<EnumDefinition[]> {
    return Promise.resolve([])
  }

  async getAllTables(db: Knex, schemas: string[]): Promise<TableDefinition[]> {
    return (await db('sqlite_master')
    .select('tbl_name AS name')
    .whereNot({ tbl_name: 'sqlite_sequence' })
    .whereIn('type', ['table', 'view']))
    .map((t: { name: string }) => ({ name: t.name, schema: 'main', comment: '' } as TableDefinition))
  }

  async getAllColumns(db: Knex, config: Config, table: string, schema: string): Promise<ColumnDefinition[]> {
    return (await db.raw(`pragma table_info(${table})`))
    .map((c: SQLiteColumn) => (
      {
        name: c.name,
        nullable: c.notnull === 0,
        type: (c.type.includes('(') ? c.type.split('(')[0] : c.type).toLowerCase(),
        optional: c.dflt_value !== null || c.notnull === 0 || c.pk !== 0,
        isEnum: false,
        isPrimaryKey: c.pk !== 0,
        comment: ''
      } as ColumnDefinition
    ))
  }
}

interface SQLiteColumn {
  name: string,
  type: string, 
  notnull: 0 | 1,
  dflt_value: string | null,
  pk: number
}
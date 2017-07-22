import * as knex from 'knex'
import { AdapterInterface, TableDefinition, ColumnDefinition } from './AdapterInterface'

export default class implements AdapterInterface {
  async getAllTables(db: knex, schemas: string[]): Promise<TableDefinition[]> {
    return await db('sqlite_master')
    .select('tbl_name AS name')
    .whereNot({ tbl_name: 'sqlite_sequence' })
    .where({ type: 'table'})
    .map((t: { name: string }) => ({ name: t.name, schema: db.client.config.connection.database }))
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
}
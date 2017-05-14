import * as knex from 'knex'
import { Config } from './Typings'
import Table from './Table'

export default class {
  db: knex
  config: Config
  tables: Table[]
  constructor(db: knex, config?: Config) {
    this.db = db
    this.config = config || {}
  }
  async getAllTables (): Promise<string[]> {
      switch (this.db.client.config.dialect) {
        case 'mysql':
          return await this.db('information_schema.tables')
          .select('table_name')
          .where({ table_schema: this.db.client.config.connection.database })
          .map((t: { table_name: string }) => t.table_name)
        case 'sqlite3':
          return await this.db('sqlite_master')
          .select('tbl_name')
          .whereNot({ tbl_name: 'sqlite_sequence' })
          .where({ type: 'table'})
          .map((t: { tbl_name: string }) => t.tbl_name)
        case 'postgres':
          return await this.db('pg_catalog.pg_tables')
          .select('tablename')
          .where({ schemaname: 'public' })
          .map((t: { tablename: string }) => t.tablename)
        case 'mssql':
          return await this.db('information_schema.tables')
          .select('table_name')
          .map((t: { table_name: string }) => t.table_name)
        default:
          throw new Error(`Fetching all tables is not currently supported for dialect ${this.db.client.config.dialect}.`)
      }
  }
  async generateTables () {
    let tables: string[]
    if (this.config.tables != null) {
      const hasTables = await Promise.all(this.config.tables.map(t => this.db.schema.hasTable(t)))
      tables = this.config.tables.filter((t, index) => hasTables[index])
    } else  {
      tables = await this.getAllTables()
    }
    this.tables = tables.map(t => new Table(t, this))
    await Promise.all(this.tables.map(t => t.generateColumns()))
  }
  stringify (): string {
    return this.tables.map(t => t.stringify()).join('\n\n')
  }
}

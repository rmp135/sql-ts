import { AdapterInterface, TableDefinition } from './Adapters/AdapterInterface';
import { buildAdapter } from "./AdapterFactory";
import * as knex from 'knex';
import { Config } from './Typings'
import Table from './Table'

export default class {
  /**
   * The Tables that this Database contains.
   * 
   * @type {Table[]}
   */
  tables: Table[] = []
  /**
   * Query the database for table definitions.
   * Not implemented for all database schemas.
   * 
   * @returns {Promise<string[]>} 
   */
  async getAllTables (db: knex, config: Config): Promise<TableDefinition[]> {
    const adapter = buildAdapter(config.dialect)
    return await adapter.getAllTables(db, config.schemas || [])
  }
  /**
   * Creates Tables based on the configuration and generates their definitions.
   * 
   */
  async generateTables (db: knex, config: Config) {
    let tables: TableDefinition[]
    tables = (await this.getAllTables(db, config))
    this.tables = tables.map(t => new Table(t.name, t.schema, config))
    await Promise.all(this.tables.map(t => t.generateColumns(db, config)))
  }
  /**
   * This Database as a line separated list of TypeScript interface definitions.
   * 
   * @returns {string} 
   */
  stringify (includeSchema: boolean): string {
    if (includeSchema) {
      const tablesBySchemas: { [schema: string]: Table[] } = {}
      for (let table of this.tables) {
        if (!tablesBySchemas.hasOwnProperty(table.schema)) {
          tablesBySchemas[table.schema] = []
        }
        tablesBySchemas[table.schema].push(table)
      }
      const namespaces: string[] = []
      for (let schema in tablesBySchemas) {
        const tables = tablesBySchemas[schema]
        namespaces.push(`export namespace ${schema} {
${tables.map(t => t.stringify(includeSchema)).join('\n\n')}
}`)
      }
      return namespaces.join('\n\n')
    } else {
      return this.tables.map(t => t.stringify(includeSchema)).join('\n\n')
    }
  }
  /**
   * This Database as a plain JavaScript object.
   * 
   * @returns
   */
  toObject () {
    return {
      tables: this.tables.map(t => t.toObject())
    }
  }
}
